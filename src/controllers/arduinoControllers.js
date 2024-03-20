import fetch from 'node-fetch';

export const ledController = async (req, res) => {
  const { state } = req.params; // get the state from the request parameters

  try {
    // replace 'arduino-ip-address' with the IP address of your Arduino
    const response = await fetch(`http://192.168.3.220/LED=${state.toUpperCase()}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    res.send(`LED is ${state}`);
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    res.status(500).send('An error occurred while sending the GET request');
  }
};
