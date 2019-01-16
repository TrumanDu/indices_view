import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
} from '@elastic/eui';

import IndicesView from './../../indicesView/indicesView';

export class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

  }
  render() {
    const page = <IndicesView/>;
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            {page}
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
