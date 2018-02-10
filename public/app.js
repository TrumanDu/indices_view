import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'angular-ui-bootstrap';
import 'ui/autoload/styles';
import './less/main.less';
import template from './templates/index.html';

uiRoutes.enable();
uiRoutes.when('/', {
  template: template,
  controller: 'indiesViewHome',
  controllerAs: 'ctrl'
});

class IndicesObj {
  constructor(indexName, totalSizeHuman, totalSize, totalDocs, primariesSizeHuman, primariesSize, primariesDocs, totalSearch, totalGet, totalQuery) {
    this.indexName = indexName;
    this.totalSizeHuman = totalSizeHuman;
    this.totalSize = totalSize;
    this.totalDocs = totalDocs;
    this.primariesSize = primariesSize;
    this.primariesSizeHuman = primariesSizeHuman;
    this.primariesDocs = primariesDocs;
    this.totalSearch = totalSearch;
    this.totalGet = totalGet;
    this.totalQuery = totalQuery;
  }
}

function countProperties(obj) {
  let count = 0;
  for (const property in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      count++;
    }
  }
  return count;
}

function reSortAndFind($scope) {
  let result = new Array();
  const indexName = $scope.indexName;

  let data = new Array();
  if (!$scope.merge) {
    data = reBuildOriginData($scope.orignData);
  } else {
    data = $scope.resultDataArray;
  }
  if (indexName != null) {
    const tempArray = new Array();
    data.forEach(function (value) {
      const name = value.indexName;
      if (name.indexOf(indexName) >= 0) {
        tempArray.push(value);
      }
    });
    result = tempArray;
  } else {
    result = data;
  }
  return result;
}

/**
 * 构建页面展示所需要格式数据
 * @param {*} orignData
 */
function reBuildOriginData(orignData) {
  const newOrignData = new Array();
  for (const key in orignData) {
    if (orignData.hasOwnProperty(key)) {
      const element = orignData[key];
      const obj = new IndicesObj(key, element.total.store.size, element.total.store.size_in_bytes, element.total.docs.count, element.primaries.store.size, element.primaries.store.size_in_bytes, element.primaries.docs.count, element.total.search.query_total, element.total.get.total, element.total.query_cache.total_count);
      newOrignData.push(obj);
    }
  }
  return newOrignData;
}

/**
 * 合并index，并计算大小
 * @param {*} tempData
 */
function mergetIndexName(tempData, pattern) {
  const resultDataArray = new Array();
  const map = new Map();
  //[\\d]{4}[-|\\.|/][\\d]{1,2}[-|\\.|/][\\d]{1,2}
  const regx = new RegExp(pattern);
  for (const key in tempData) {
    const result = regx.exec(key);
    let prefix = '';
    if (result != null && result.index > 0) {
      prefix = key.substring(0, result.index);
    } else {
      prefix = key;
    }
    if (map.has(prefix)) {
      const temp = map.get(prefix);
      temp.push(tempData[key]);
      map.set(prefix, temp);
    } else {
      const temp = new Array();
      temp.push(tempData[key]);
      map.set(prefix, temp);
    }
  }
  const kb = 1024;
  const mb = 1024 * 1024;
  const gb = 1024 * 1024 * 1024;
  map.forEach(function (value, key) {
    let size = 0;
    let totalDocs = 0;
    let primariesSize = 0;
    let primariesDocs = 0;

    let search = 0;
    let get = 0;
    let query = 0;
    for (const data of value) {
      const indexSize = data.total.store.size_in_bytes;
      size = size + indexSize;
      totalDocs = totalDocs + data.total.docs.count;
      primariesSize = primariesSize + data.primaries.store.size_in_bytes;
      primariesDocs = primariesDocs + data.primaries.docs.count;
      search = search + data.total.search.query_total;
      get = get + data.total.get.total;
      query = query + data.total.query_cache.total_count;
    }
    let totalSize;
    if (size > gb) {
      totalSize = (size / gb).toFixed(2) + ' gb';
    } else if (size > mb) {
      totalSize = (size / mb).toFixed(2) + ' mb';
    } else {
      totalSize = (size / kb).toFixed(2) + ' kb';
    }
    let primariesSizeHuman;
    if (primariesSize > gb) {
      primariesSizeHuman = (primariesSize / gb).toFixed(2) + ' gb';
    } else if (size > mb) {
      primariesSizeHuman = (primariesSize / mb).toFixed(2) + ' mb';
    } else {
      primariesSizeHuman = (primariesSize / kb).toFixed(2) + ' kb';
    }
    const obj = new IndicesObj(key + '*(' + value.length + ')', totalSize, size, totalDocs, primariesSizeHuman, primariesSize, primariesDocs, search, get, query);
    resultDataArray.push(obj);
  });
  return resultDataArray;
}

uiModules
  .get('app/indies_view', ['ui.bootstrap'])
  .controller('indiesViewHome', function ($http, $scope, $injector) {
    const Notifier = $injector.get('Notifier');
    const notify = new Notifier({ location: 'Dashboard' });
    $scope.merge = true;
    $scope.pattern = /[^a-z]+$/;
    $http
      .get('../api/indices_view/_stats')
      .then((response) => {
        const tempData = response.data.indices;
        $scope.orignData = tempData;
        $scope.resultDataArray = mergetIndexName(tempData, $scope.pattern);
        $scope.indices = reSortAndFind($scope);
        $scope.info = {
          'indexSize': countProperties(response.data.indices),
          'doc': response.data._all.primaries.docs.count,
          'store': response.data._all.total.store.size,
          'shards': response.data._shards.total
        };
      });

    $scope.predicate = 'totalSize';
    $scope.reverse = true;
    $scope.order = function (predicate) {
      $scope.reverse = ($scope.predicate === predicate)
        ? !$scope.reverse
        : false;
      $scope.predicate = predicate;
    };

    $scope.$watch('indexName', function () {
      $scope.indices = reSortAndFind($scope);
    });

    $scope.$watch('merge', function () {
      $scope.indices = reSortAndFind($scope);
    });

    $scope.changePattern = function () {
      try {
        const pattern = eval($scope.pattern);
        $scope.resultDataArray = mergetIndexName($scope.orignData, pattern);
        $scope.indices = reSortAndFind($scope);
      } catch (e) {
        notify.error('pattern has error.', e); // pass exception object to error handler
      }

    };
  });
