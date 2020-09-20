import React, {useState, useEffect, useContext} from 'react';
import { withFirebase } from '../Firebase';

import { withAuthorization } from '../Session';
import AuthUserContext from '../Session/context';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Table,Button, Form} from 'react-bootstrap';
const HomePage = (props) => {

  const user = useContext(AuthUserContext);
  
  const [weatherInfo, setWeatherInfo] = useState({})
  const [userProperties, setUserProperties] = useState({})
  const [websiteToAdd, setWebsiteToAdd] = useState("");
  

  const tableStyle = {
    margin: "0px auto",
    color: "black",
    backgroundColor: "white",
    width:"50%"
  };
  
  useEffect(() => {
    //@Natalia get the weather here and set your state
    getUserAndWeatherData();
  }, []);

  //@Natalia useEffect is a hook that executes every time something changes
  //in this case, when userProperties change ( because we have update the zip code
  //the code inside useEffect will execute
  useEffect(() => {
    if (userProperties && userProperties.email)
    {
    setUserInfo();
    getWeatherData(userProperties.zipCode).then( (weatherInfo) => 
    {
      setWeatherInfo(weatherInfo);
      console.table(weatherInfo)
    })
  }
  }, [userProperties]);


  /**
   * Gets the initial user data, then retrieves the weather data using the zip code
   * of the user 
   */
  const getUserAndWeatherData = ()=>{
    props.firebase.db.ref('users/' + user.uid).once("value", snap => {
      // @Natalia userProperties will have all of your user properties ( name, email, zipCode)
      let databaseData = snap.val();
      setUserProperties(databaseData);
      let zipCode = databaseData.zipCode;

      getWeatherData(zipCode).then( (weatherInfo) => 
      {
        setWeatherInfo(weatherInfo);
        console.table(weatherInfo)
      })

    })
  }

  /**
   * Gets the current weather by zip code !
   */
  const getWeatherData = async (zipCode)=>{
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=4866097d7d3a400435dc896d1ba8df5e`);
    const weatherData = await response.json();
    return weatherData;
  }

  /**
   * used to prompt for a new zip
   * and set the state for the userProperties
   * when the userProperties change, we will push the new properties to firebase
   * and get the updated weather ( using the useEffect hook )
   */
  const handleChangeZip = () =>{
    let newZip = prompt("new zip ");
    setUserProperties(prevState => ({
      ...prevState,
      zipCode: newZip
    }));
    
  }

  /**
   * updates the user properties in the firebase database
   */
  const setUserInfo = () =>{
    props.firebase.db.ref('users/' + user.uid).set(userProperties).catch(error => {
      console.log(error.message)
  });
  }

  const iconUrl = weatherInfo.weather && "http://openweathermap.org/img/wn/" + weatherInfo.weather[0].icon + "@2x.png";


  const handleWebsiteChange = (e) => {
    setWebsiteToAdd(e.target.value);
  }

  const updateWebsiteList = (newWebsiteList) =>{
    let currentWebSiteList = userProperties.websites?Object.assign(userProperties.websites):[];
    currentWebSiteList.push(websiteToAdd);

    setUserProperties(prevState => ({
      ...prevState,
      websites: currentWebSiteList
    }));
  }

  const deleteWebsiteByIndex = ( index ) =>{
    let currentWebSiteList = userProperties.websites?Object.assign(userProperties.websites):[];
    currentWebSiteList.splice(index, 1);

    setUserProperties(prevState => ({
      ...prevState,
      websites: currentWebSiteList
    }));
  }

  return (
     /*
  @Natalia Note here we have wrapped the code that is inside the HomePage component
  with the AuthUserContext.Consumer tag. This will give us access to the authUser object that has
  our user properties such as the uid, email etc..
  to access the uid we simply do {authUser.uid}
  the uid will be useful to retrieve the zip Code for the specific user
  */
<div>
  <div className="banner">
    <h1>Welcome {userProperties.username}</h1>
  </div>
  <div>
  {/* whatever you use to display the weather can be its own component
  you would just pass it the weatherinfo as a prop */}
  <Table style={tableStyle} striped bordered hover size="sm">
  <thead>
    <tr>
      <th colSpan={2}>The weather in {weatherInfo.name}  ({userProperties.zipCode})</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Description</td>
      <td>{weatherInfo.weather && weatherInfo.weather[0].description}</td>
    </tr>
    <tr>
      <td>Icon</td>
      <td>{weatherInfo.weather&&<img src={iconUrl}/>}</td>
    </tr>
    <tr>
      <td><Button onClick={ () => handleChangeZip()}>Change my Zip</Button></td>
      <td></td>
    </tr>
  </tbody>
</Table>
<div style={tableStyle}>
  <h2>My favorite websites</h2>
  {!userProperties.websites && <p>It looks like you do not have any favorite websites, how sad!</p>}
  <Form>
  <Form.Group controlId="formWebsite">
    <Form.Control type="text" placeholder="Enter URL here"  onChange={handleWebsiteChange}/>
  </Form.Group>
  <Button variant="primary" onClick={updateWebsiteList}>
    Submit
  </Button>
</Form>

<Table style={tableStyle} striped bordered hover size="sm">
  <thead>
    <tr>
      <th colSpan={2}>Urls</th>
    </tr>
  </thead>
  <tbody>
  {userProperties.websites &&
userProperties.websites.map((url, index) => 
    <tr key={index}>
      <td><a href={url} target="_blank">{url}</a></td>
      <td><Button onClick={() => deleteWebsiteByIndex(index)}>DELETE</Button></td>
    </tr>
)}
  </tbody>
</Table>
</div>

  </div>

  </div>
)}

const condition = (authUser) => !!authUser;

export default withFirebase(withAuthorization(condition)(HomePage));


