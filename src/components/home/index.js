import { h, Component } from 'preact';
import style from './style.less';
import { Picker, List , Carousel} from 'antd-mobile';
import { district } from 'antd-mobile-demo-data';
export default class Home extends Component {
  constructor (props) {
    super(props);
  }
  state = {
    // date: zhNow
    duration:[],
    durationValue: []
  }
  onClickDuration = ()=> {
    setTimeout(() => {
      this.setState({
        duration: district,
      });
    }, 500);
  }
  changeDuration = () => {
    console.log('change')
  }
	render() {
		return (
			<div class={style.home}>
				<h1>Home</h1>
				<p>This is the Home component.</p>
        <Picker
          data={this.state.duration}
          cols={1}
          value={this.state.durationValue}
          onChange={this.changeDuration}
        >
          <List.Item arrow="horizontal" onClick={this.onClickDuration} last>选择地区（单列）</List.Item>
        </Picker>
        {
        // 跑马灯也有同样问题
        //   <Carousel className="my-carousel"
        //   vertical
        //   dots={false}
        //   dragging={false}
        //   swiping={false}
        //   autoplay
        //   infinite
        // >
        //   <div className="v-item">Carousel 1</div>
        //   <div className="v-item">Carousel 2</div>
        //   <div className="v-item">Carousel 3</div>
        // </Carousel>
        }
			</div>
		);
	}
}
