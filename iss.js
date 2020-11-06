const request = require('request');

const fetchMyIP = (callback) => {
  request('https://api.ipify.org/?format=json', (error, response, body) => {

    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
    return;

  });
};

const fetchCoordsByIP = (ip, callback) => {

  request(`http://ip-api.com/json/${ip}`, (error, response, body) => {

    if (error) return callback(error, null);

    const data = JSON.parse(body);

    // using new api therefore invalid query still sends back 200 status code
    // must check if data.status === 'fail' to see if ip address isn't valid input
    if (response.statusCode !== 200 || data.status === "fail") {
      const msg = `${data.status}, ${data.message} when fetching coordinates. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const coords = {
      latitude: data.lat,
      longitude: data.lon
    }; 

    callback(null, coords);
    return;

  });

};

const fetchISSFlyOverTimes = (coords, callback) => {
  
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {

    if (error) return callback(error, null);
    
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching ISS pass times: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const passes = JSON.parse(body).response;

    callback(null, passes);
    return;

  });

};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {
  fetchMyIP,
  fetchCoordsByIP,
  fetchISSFlyOverTimes,
  nextISSTimesForMyLocation
};