/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { Component, Fragment } from 'react';
import {
  EuiInMemoryTable,
  EuiSpacer,
  EuiSwitch,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldText,
  EuiNotificationBadge
} from '@elastic/eui';
import '../less/main.less';
import axios from 'axios';
class IndicesObj {
  constructor(indexName, totalSize, totalDocs, primariesSize, primariesDocs, totalSearch, totalGet, totalQuery) {
    this.indexName = indexName;
    this.key = indexName;
    this.totalSize = totalSize;
    this.totalDocs = totalDocs;
    this.primariesSize = primariesSize;
    this.primariesDocs = primariesDocs;
    this.totalSearch = totalSearch;
    this.totalGet = totalGet;
    this.totalQuery = totalQuery;
  }
}

const renderNum = (numValue) => {
  {
    let num = (numValue || 0).toString();
    let result = '';
    while (num.length > 3) {
      result = ',' + num.slice(-3) + result;
      num = num.slice(0, num.length - 3);
    }
    if (num) {
      result = num + result;
    }
    return result;
  }
};

const formatBytes = (size) => {
  const kb = 1024;
  const mb = 1024 * 1024;
  const gb = 1024 * 1024 * 1024;
  const tb = 1024 * 1024 * 1024 * 1024;
  if (size > tb) {
    size = (size / tb).toFixed(2) + ' tb';
  }else if (size > gb) {
    size = (size / gb).toFixed(2) + ' gb';
  } else if (size > mb) {
    size = (size / mb).toFixed(2) + ' mb';
  } else {
    size = (size / kb).toFixed(2) + ' kb';
  }
  return size;
};

let debounceTimeoutId;
let requestTimeoutId;
export default class Table extends Component {
  constructor(props) {
    super(props);
    this.queryIndicesStats = this
      .queryIndicesStats
      .bind(this);
    this.onPatternChange = this
      .onPatternChange
      .bind(this);
    this.handelChange = this
      .handelChange
      .bind(this);
    this.state = {
      merge: true,
      filters: false,
      store: [],
      isLoading: true,
      queryParam: null,
      indexSize: 0,
      doc: 0,
      storeSize: 0,
      shards: 0,
      mergePattern: this.props.mergePattern
    };
  }
  /**
   * 构建页面展示所需要格式数据
   * @param {*} orignData
   */
  reBuildOriginData(orignData) {
    const newOrignData = new Array();
    for (const key in orignData) {
      if (orignData.hasOwnProperty(key)) {
        const element = orignData[key];
        const obj = new IndicesObj(key, element.total.store.size_in_bytes, element.total.docs.count,
          element.primaries.store.size_in_bytes, element.primaries.docs.count, element.total.search.query_total,
          element.total.get.total, element.total.query_cache.total_count);
        newOrignData.push(obj);
      }
    }
    return newOrignData;
  }

  /**
   * 合并index，并计算大小
   * @param {*} tempData
   */
  mergetIndexName(tempData, pattern) {

    const resultDataArray = new Array();
    const map = new Map();
    const regx = new RegExp(pattern);
    for (const key in tempData) {
      if (tempData.hasOwnProperty(key)) {
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
    }
    map
      .forEach(function (value, key) {
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
        const obj = new IndicesObj(key + '*(' + value.length + ')', size, totalDocs, primariesSize, primariesDocs, search, get, query);
        resultDataArray.push(obj);
      });
    return resultDataArray;
  }

  async queryIndicesStats() {
    this.setState({ isLoading: true });
    // 使用 axios 获取数据
    const { data } = await axios('../api/indices_view/_stats');
    const indices = data.indices;
    const originData = this.reBuildOriginData(indices);
    let store = [];
    if (this.state.merge) {
      store = this.mergetIndexName(indices, this.state.mergePattern);
    } else {
      store = this.reBuildOriginData(indices);
    }
    //处理queryParam需要过滤的数据
    if (this.state.queryParam != null) {
      const indicesObjs = store.filter(indicesObj => {
        const normalizedName = `${indicesObj
          .indexName}`
          .toLowerCase();
        const normalizedQuery = this
          .state
          .queryParam
          .toLowerCase();
        return normalizedName.indexOf(normalizedQuery) !== -1;
      });
      this.setState({
        store: indicesObjs,
        indices: indices,
        isLoading: false,
        indexSize: originData.length,
        doc: data._all.primaries.docs.count,
        storeSize: formatBytes(data._all.total.store.size_in_bytes),
        shards: data._shards.total
      });
    } else {
      this.setState({
        store: store,
        indices: indices,
        isLoading: false,
        indexSize: originData.length,
        doc: data._all.primaries.docs.count,
        storeSize: formatBytes(data._all.total.store.size_in_bytes),
        shards: data._shards.total
      });
    }

  }

  componentDidMount() {
    this.queryIndicesStats();
  }

  mergeFilter(_this) {
    let store = [];
    if (!_this.state.merge) {
      store = _this.mergetIndexName(this.state.indices, this.state.mergePattern);
    } else {
      store = _this.reBuildOriginData(this.state.indices);
    }
    //处理queryParam需要过滤的数据
    if (this.state.queryParam != null) {
      const indicesObjs = store.filter(indicesObj => {
        const normalizedName = `${indicesObj
          .indexName}`
          .toLowerCase();
        const normalizedQuery = this
          .state
          .queryParam
          .toLowerCase();
        return normalizedName.indexOf(normalizedQuery) !== -1;
      });
      store = indicesObjs;
    }


    _this.setState({
      store: store,
      merge: !_this.state.merge
    });
  }
  onPatternChange() {
    let store = [];
    if (this.state.merge) {
      store = this.mergetIndexName(this.state.indices, this.state.mergePattern);
    } else {
      store = this.reBuildOriginData(this.state.indices);
    }
    this.setState({ store: store });
  }

  handelChange(e) {
    this.setState({ mergePattern: e.target.value });
  }
  renderToolsRight() {
    return [(<EuiFieldText
      placeholder="Merget Pattern"
      defaultValue={this.state.mergePattern}
      onBlur={this.onPatternChange}
      onChange={this.handelChange}
    />),
    (<EuiSwitch
      label="Merge"
      key="MergeEuiSwitch"
      checked={this.state.merge}
      onChange={() => this.mergeFilter(this)}
    />)];
  }

  onQueryChange = ({ query }) => {
    clearTimeout(debounceTimeoutId);
    clearTimeout(requestTimeoutId);

    debounceTimeoutId = setTimeout(() => {
      this.setState({ isLoading: true });

      requestTimeoutId = setTimeout(() => {
        let store = [];
        if (this.state.merge) {
          store = this.mergetIndexName(this.state.indices, this.state.mergePattern);
        } else {
          store = this.reBuildOriginData(this.state.indices);
        }
        const indicesObjs = store.filter(indicesObj => {
          const normalizedName = `${indicesObj
            .indexName}`
            .toLowerCase();
          const normalizedQuery = query
            .text
            .toLowerCase();
          return normalizedName.indexOf(normalizedQuery) !== -1;
        });

        this.setState({ isLoading: false, store: indicesObjs, queryParam: query.text });
      }, 1000);
    }, 300);
  };

  render() {
    const columns = [
      {
        field: 'index',
        name: 'Index',
        sortable: true,
        render: () => <span className="tablerow" />,
        truncateText: false
      }, {
        field: 'indexName',
        name: 'Index Name',
        sortable: true,
        width: '30%',
        truncateText: false
      }, {
        field: 'totalSize',
        name: 'Total Size',
        sortable: true,
        render: (size) => formatBytes(size)
      }, {
        field: 'totalDocs',
        name: 'Total Docs',
        sortable: true,
        render: (totalDocs) => renderNum(totalDocs)
      }, {
        field: 'primariesSize',
        name: 'Primaries Size',
        sortable: true,
        render: (size) => formatBytes(size)
      }, {
        field: 'primariesDocs',
        name: 'Primaries Docs',
        sortable: true,
        render: (primariesDocs) => renderNum(primariesDocs)
      }, {
        field: 'totalSearch',
        name: 'Search Count ',
        sortable: true,
        render: (totalSearch) => renderNum(totalSearch)
      }, {
        field: 'totalGet',
        name: 'Get Count',
        sortable: true,
        render: (totalGet) => renderNum(totalGet)
      }, {
        field: 'totalQuery',
        name: 'Query Count',
        sortable: true,
        render: (totalQuery) => renderNum(totalQuery)
      }
    ];

    const sorting = {
      sort: {
        field: 'totalSize',
        direction: 'desc'
      }
    };
    const search = {
      onChange: this.onQueryChange,
      box: {
        incremental: true
      },
      toolsRight: this.renderToolsRight()
    };
    const page = (
      <Fragment>
        <EuiSpacer size="l"/>
        <EuiInMemoryTable
          className="table"
          items={this.state.store}
          loading={this.state.isLoading}
          columns={columns}
          search={search}
          pagination={false}
          sorting={sorting}
        />
      </Fragment>
    );
    return (
      <div>
        <EuiFlexGroup justifyContent="spaceEvenly">
          <EuiFlexItem grow={false}>
            <span>Indices:&nbsp;&nbsp;
              <EuiNotificationBadge>{renderNum(this.state.indexSize)}</EuiNotificationBadge>
            </span>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <span>Documents:&nbsp;&nbsp;
              <EuiNotificationBadge>{renderNum(this.state.doc)}</EuiNotificationBadge>
            </span>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <span>Disk Usage:&nbsp;&nbsp;
              <EuiNotificationBadge>{this.state.storeSize}</EuiNotificationBadge>
            </span>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <span>Shards:&nbsp;&nbsp;
              <EuiNotificationBadge>{renderNum(this.state.shards)}</EuiNotificationBadge>
            </span>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer/> {page}
      </div>
    );
  }
}
