import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import Header from './components/Header.js'
import Add from './components/Add.js'
import Rules from './components/Rules.js'
import Select from './components/SelectGame'
import Player from './components/PlayerSelect.js'
import Board1 from './components/Player1_Board'
import Board2 from './components/Player2_Board'
import 'bootstrap/dist/css/bootstrap.min.css';
// import LoadingPage from './components/Loading.js'

// import css
import IndexCSS from './index.module.css';

// importing gif
import l1 from './loading-images/l1.gif'

const loadingGifsList = [l1]

const App = () => {
  // API data
  let [games, setGames] = useState([])
  // show/hides Add.js
  let [showAdd, setAdd] = useState(false)
  // show/hides Rules.js
  let [showRules, setRules] = useState(true)
  // show/hides SelectGame.js
  let [showSelect, setSelect] = useState(false)
  // show/hides the PlayerSelect and Player1/Player2 board until choice is made on SelectGame.js
  let [currentGameID, setCurrentGameID] = useState('')
  // show/hides PlayerSelect.js page
  let [playerSelect, setPlayerSelect] = useState(true)
  // show/hides Player1_Board.js page
  let [showP1, setP1] = useState(false)
  // show/hides Player2_Board.js page
  let [showP2, setP2] = useState(false)
  //show/hides loading images
  const [isLoading, setIsLoading] = useState(true)
  // selects random gif 
  const loadingGif = loadingGifsList[Math.floor(Math.random() * loadingGifsList.length)]


  //=========================================================================
  //DELETE GAME
  const handleDelete = (event) => {
    axios.delete('https://connect4back.herokuapp.com/api/connect4/' + event.id).then((response) => {
      getGames();
    })
  }

  //=========================================================================
  //EDIT GAME
  const handleUpdate = (game) => {
    axios.put('https://connect4back.herokuapp.com/api/connect4/' + game.id, game).then((response) => {
      getGames();
    })
  }

  //=========================================================================
  //Create new game with players
  const handleCreate = (add) => {
    axios.post('https://connect4back.herokuapp.com/api/connect4', add).then((response) => {
      getGames();
    })
  }
  //=========================================================================
  //collect from database
  const getGames = () => {
    axios.get('https://connect4back.herokuapp.com/api/connect4').then((response) =>
      setGames(response.data),
      // , (err) => 
      // console.log(err)
    )
  }
  //=========================================================================
  //useEffect to collect from database
  useEffect(() => {
    getGames();
    websocketConnect();

    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, [])

  // useInterval(getGames, 5000)
  // ========================================================================
  // websocket connection - will "getgames" each time there is an update
  const websocketConnect = () => {
    const subscriberID = Math.floor(Math.random() * 10000)
    const subscriptionMsg = {
      "type": "subscribe",
      "id": subscriberID,
      "model": "connect4.Connect4",
      "action": "list"
    }

    // websocket to API
    const webSocket = new WebSocket('wss://connect4back.herokuapp.com/ws/api')
    // SUBSCRIPTION MESSAGE FROM "DJANGO LIVE-DATA TUTORIAL"
    webSocket.onopen = (event) => {
      console.log('connected, onopen triggered, sending stringified subscription message, subscriber ID: ' + subscriptionMsg.id);
      webSocket.send(JSON.stringify(subscriptionMsg))
    }

    // ON CHANGES IN THE DATABASE, USE GETGAME FUNCTION
    webSocket.onmessage = (event) => {
      let receivedData = JSON.parse(event.data)
      console.log("received data for game id: " + receivedData.instance.id);
      if (receivedData.instance.id == currentGameID) {
        getGames();
      }
    }
  }
  // ========================================================================
  // display page
  return (
    <>
      {isLoading && <img className={IndexCSS.loadingGif} src={loadingGif} alt='loading spinner' />}
      {!isLoading && (
        <div className={IndexCSS.appContainer}>
          {/* Header of app */}
          <Header setAdd={setAdd} setRules={setRules} setSelect={setSelect} setCurrentGameID={setCurrentGameID} setP1={setP1} setP2={setP2} />
          <div key={games.id}>
            {/* Show/Hide Rules.js */}
            {
              showRules === true ? <Rules setRules={setRules} /> : null
            }
            {/* Show/Hide Add.js */}
            {
              showAdd === true ? <Add handleCreate={handleCreate} setAdd={setAdd} setSelect={setSelect} /> : null
            }
            {/* show/hide SelectGame.js */}
            {
              showSelect === true ? <Select games={games} setSelect={setSelect} setCurrentGameID={setCurrentGameID} setPlayerSelect={setPlayerSelect} /> : null
            }
            {

            }
            {/* render game based on game ID selected from SelectGame.js */}
            {games.map((game) => {
              if (game.id === currentGameID) {
                return (
                  <div key={game.id}>
                    {/* Have player select P1 or P2, then render page */}
                    {
                      playerSelect === true ? <Player game={game} setP1={setP1} setP2={setP2} setSelect={setSelect} setPlayerSelect={setPlayerSelect} /> : null
                    }
                    {/* show P1 page if true, else null */}
                    {
                      showP1 === true ? <Board1 game1={game} handleDelete={handleDelete} handleUpdate={handleUpdate} /> : null
                    }
                    {/* show P1 page if true, else null */}
                    {
                      showP2 === true ? <Board2 game2={game} handleDelete={handleDelete} handleUpdate={handleUpdate} /> : null
                    }
                  </div>
                )
              } else {
                return null
              }
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default App