import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NoSleep from '@uriopass/nosleep.js'
import moment from 'moment'

function App() {
  const [isNoSleep, setSleep] = useState(false)
  const noSleep = useRef(new NoSleep());
  const checkSleepIntervalId = useRef<number>();
  const checkIntervalUnixTime = useRef<number>();
  const ws = useRef<WebSocket>();
  const [websocketmsg, setWebsocketmsg] = useState('');

  useEffect(() => {
    ws.current = new WebSocket('wss://echo.websocket.org');
    ws.current.onopen = () => {
      console.log('open websocket');
    }

    ws.current.onmessage = (e) =>{
      console.log(e.data,':pong!!');
    }

    ws.current.onclose = () =>{
      console.log('closed');
    }
  }, [])
  

  const startCheckSleep = ()=>{
    const sleepIntervalId = setInterval(()=>{

      const now = moment().unix();

      ws.current?.send(JSON.stringify({
        to:'sleep',
        msg:'ping!!'
      }));

      setWebsocketmsg(`ping!! ${now}`);



      console.log('check sleep:',now,' ','comparetime:',checkIntervalUnixTime.current);

      // NOTE: 現在時刻が、前回起動してから5秒以上経過していたら、画面OFFになっていたと判断してアラートを出す+強制NoSleepOFF
      if(!checkIntervalUnixTime.current &&
        moment(now).isAfter(moment(checkIntervalUnixTime.current).add(5,'s'))){

        window.alert(`画面のOFFを検知。\n処理を停止します。\n最終送信時刻: ${moment(checkIntervalUnixTime.current).format('HH:mm:ss')}`)
        clearInterval(checkSleepIntervalId.current);
        checkIntervalUnixTime.current = undefined;
        noSleep.current.disable();
        setSleep(false);
        setWebsocketmsg('');
      }else{
        checkIntervalUnixTime.current = now;
      }
    },1000);
    checkSleepIntervalId.current = sleepIntervalId;
  };

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => {
          if(isNoSleep){
            noSleep.current.disable();
            clearInterval(checkSleepIntervalId.current);
            checkIntervalUnixTime.current = undefined;
            setWebsocketmsg('');
          }else{
            noSleep.current.enable();
            startCheckSleep();
          }
          setSleep((pre)=>!pre);
        }}>
          noSleep now {isNoSleep?'enable':'disabled'}
        </button>
        <p>
          {websocketmsg}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
