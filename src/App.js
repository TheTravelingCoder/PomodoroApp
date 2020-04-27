import React, { Component } from 'react';
import logo from './logo.svg';
import { Button } from 'react-bootstrap';
import './App.css';
        
class Timer extends Component {

  constructor (props) {
    super (props)
    this.state = {
      countstart: 1500,
      count: 1500
    }
  }
  stopTimer = () => {
    clearInterval(this.myInterval)
  }
  startTimer = () => {
    this.myInterval = setInterval(() => {
      this.setState(() => ({
        count: this.state.count - 1
      }))
    }, 1000)
  }
  getSeconds = () => {
    return ('0' + this.state.count % 60).slice(-2);
  }
  getMinutes = () => {
    return Math.floor(this.state.count / 60)
  }
  resetTimer = () => {
    this.setState({count: 1500})
  }
  render () {
    const {count} = this.state
    return (
      <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Pomodoro Clock: <br/>
          {this.getMinutes(count)} : {this.getSeconds(count)}</h1>
        <div className="row">
          <Button className="button btn-primary" id="start" onClick={this.startTimer}> Start </Button>
          <Button className="button btn-primary" id="stop" onClick={this.stopTimer}> Stop </Button>
          <Button className="button btn-primary" id="reset" onClick={this.resetTimer}> Reset </Button>
        </div>
      </header>
    </div>
    )
  }
       
  componentDidMount () {
    this.myInterval = setInterval(() => {
      if(this.state.count > 0){
        this.setState(() => ({
        count: this.state.count - 1
      }))}
      else{
        if(this.state.countstart > 300){
          this.setState({count: 300,
          countstart: 300})
        }else{
          this.setState({count: 1500,
          counstart: 1500})
        }
      }
    }, 1000)
  }
        
  componentWillUnmount () {
    clearInterval(this.myInterval)
  }
}
      
export default Timer;
