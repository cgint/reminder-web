import Main from './Main.svelte';
import 'bootstrap/dist/css/bootstrap.min.css';

const app = new Main({
  target: document.getElementById('app'),
});

export default app;
