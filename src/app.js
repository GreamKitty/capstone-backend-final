import { routes } from './route.js'; 
import Hapi from '@hapi/hapi';
import Cookie from '@hapi/cookie';

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

 server.route(routes);

 

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};


init();