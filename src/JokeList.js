import React from "react"
import axios from "axios"
import Joke from "./Joke.js"
import { v4 as uuid } from 'uuid';
import "./JokeList.css"

export default class Joke_list extends React.Component {
  static defaultProps = {
    numberJokes:10 
  }
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
    loading: false};
    this.seenJokes = new Set(this.state.jokes.map(j=>j.joke))
  }
  handleClick() {
    this.setState({loading: true}, this.getJokes);
  }

  componentDidMount() {
    if(this.state.jokes.length === 0) {
      this.getJokes();
    }  
  }
  async getJokes(){
    try{
      this.setState({loading: true})
      let jokes = [];
      while(jokes.length < this.props.numberJokes) {
        let res = await axios.get(`https://icanhazdadjoke.com/`, 
            {headers:{ Accept: "application/json"}});
        if(!this.seenJokes.has(res.data.joke)) {
          jokes.push({id:uuid(),joke : res.data.joke, votes: 0});
        } else {
          console.log("Found duplicate")
          console.log(res.data.joke)
        }
      }
      jokes = [...this.state.jokes, ...jokes]
      jokes = jokes.sort((a, b)=> b.votes - a.votes)
      this.setState(st=>({
        loading: false,
        jokes: jokes
      }),
        ()=> {
          
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        }
      );
      window.localStorage.setItem(
        "jokes",
        JSON.stringify(jokes))
    } catch (e) {
      alert(e);
      this.setState({ loading:false });
    }
  }

  handleVote(id, change) {
    // -1 for downvote and +1 for upvote 
    this.setState(
      st => ({
        loading: false,
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + change } : j
        )
      }), 
      ()=> window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      )
  }
  render() {
    if(this.state.loading) {
      return(
            <div className="spinner">
              <i className="far fa-8x fa-laugh fa-spin" />
              <div className="JokeList-title">Loading ...</div>
            </div>
            )
    }
    

    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title"> <span>Dad</span> Jokes</h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className='JokeList-getmore' onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>
        
        <div className="JokeList-jokes">
        {this.state.jokes.map(j=>(
          <Joke 
              key={j.id}
              votes={j.votes}
              joke={j.joke}
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)} />
          ))}
        </div>
      </div>
          )
  }
}
