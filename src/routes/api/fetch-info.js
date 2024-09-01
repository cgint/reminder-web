import axios from 'axios';

export async function post({ request }) {
  const { userInputTicker } = await request.json();

  try {
    const response = await axios.get(userInputTicker);
    return {
      status: 200,
      body: response.data
    };
  } catch (error) {
    return {
      status: 500,
      body: { error: 'Error fetching data' }
    };
  }
}