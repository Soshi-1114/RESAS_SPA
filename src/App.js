import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import MediaQuery from 'react-responsive';

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this._changeSelection = this._changeSelection.bind(this);
  }

  componentDidMount() {
    // 都道府県一覧API: https://opendata.resas-portal.go.jp/docs/api/v1/prefectures.html
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': '6euBMEmjVCfP3tyHLESG1wVt2WugeW7Qac6VRCoD' }
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  _changeSelection(index) {
    const selected_copy = this.state.selected.slice();
    // 真偽値を反転
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      // チェックされていなかった場合はデータを取得
      // 人口構成API: https://opendata.resas-portal.go.jp/docs/api/v1/population/composition/perYear.html
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index +
          1}`,
        {
          headers: { 'X-API-KEY': "6euBMEmjVCfP3tyHLESG1wVt2WugeW7Qac6VRCoD" }
        }
      )
        .then(response => response.json())
        .then(res => {
          let tmp = [];
          // lavel:総人口
          Object.keys(res.result.data[0].data).forEach(i => {
            tmp.push(res.result.data[0].data[i].value);
          });
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: tmp
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      // チェック済みの場合はseriesから削除
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderItem(props) {
    return (
      <div
        key={props.prefCode}
        style={{ margin: '5px', display: 'inline-block' }}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this._changeSelection(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: '選択した都道府県の人口推移'
      },
      yAxis: {
        title: {
            text: '総人口（人）'
        }
      },
      xAxis: {
        title: {
          text: '年度（年）'
      }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointInterval: 5,
          pointStart: 1965,
        }
      },
      responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    },
      series: this.state.series
    };

    const titleStyle1 = {
      color: '#333333',
      padding: '0.5em 0',
      borderTop: 'solid 3px #DDDDDD',
      borderBottom: 'solid 3px #DDDDDD',
      textAlign: 'center',
      fontSize: '40pt',
    }

    const titleStyle2 = {
      color: '#333333',
      padding: '0.5em 0',
      borderTop: 'solid 3px #DDDDDD',
      borderBottom: 'solid 3px #DDDDDD',
      textAlign: 'center',
      fontSize: '6pt',

    }

    const prefStyle = {
      textAlign: 'center',
    }

    const horizontalLines = {
      borderTop: '3px double #8c8b8b',
    }

    return (
      <div>
        <MediaQuery query="(max-width: 767px)">
          <div style={titleStyle2}>
            <h1>都道府県別 総人口推移グラフ</h1>
          </div>
          <div style={prefStyle}>
            {Object.keys(obj).map(i => this.renderItem(obj[i]))}
          </div>
          <hr style={horizontalLines}></hr>
          <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </MediaQuery>
        <MediaQuery query="(min-width: 768px)">
          <div>
            <h1 style={titleStyle1}>都道府県別　総人口推移グラフ</h1>
          </div>
          <div style={prefStyle}>
            {Object.keys(obj).map(i => this.renderItem(obj[i]))}
          </div>
          <hr style={horizontalLines}></hr>
          <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </MediaQuery>
      </div>
    );
  }
}

export default App;