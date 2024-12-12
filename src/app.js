import { routes } from './route.js'; 
import Hapi from '@hapi/hapi';
import Cookie from '@hapi/cookie';
import Jwt from '@hapi/jwt'

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route(routes);

 
  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: 'some_shared_secret',
    verify: {
        aud: false,
        iss: false,
        sub: false,
        nbf: true,
        exp: true,
        maxAgeSec: 3600 * 24 * 30, // 1 month
        timeSkewSec: 15
    },
    validate: (artifacts, request, h) => {

        return {
            isValid: true,
            credentials: { user: artifacts.decoded.payload.user }
        };
    }
  });
  
  server.auth.default('jwt');

  await server.start();

  
  console.log(`Server berjalan pada ${server.info.uri}`);
};


init();