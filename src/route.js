import {
    registerHandler, loginHandler,
    userUploadPhoto, registerBayiHandler, getUsersHandler,
    homeHandler,
    getArticles,
    getOneArticle,
    chatBotBloomie,
    updateStatusBayi
  } from './handler.js';
  
  // Define a route that uses Firebase Authentication

  const routes = [
    {
        method: 'POST',
        path: '/login',
        options: {
          auth : false
        },
        handler: loginHandler,
    },
    {
        method: 'POST',
        path: '/register',
        options: {
          auth : false
        },
      handler: registerHandler
    },
    {
      method: 'POST',
      path: '/uploadphoto',
      handler: userUploadPhoto,
      options: {
        payload: {
            output: 'stream', // Treat the file as a stream
            parse: true,
            multipart: true,
            maxBytes: 10 * 1024 * 1024,// Optional: Limit file size (10 MB)
        },
    },
    },
    {
      method: 'POST',
      path: '/registerbayi',
      handler: registerBayiHandler
    },

    {
      method: 'POST',
      path: '/profile',
      handler: getUsersHandler,
    },
    {
      method: 'GET',
      path: '/home',
      handler: homeHandler,
    },
    {
      method: 'POST',
      path: '/updatestatusbayi',
      handler: updateStatusBayi,
    },
    {
      method: 'GET',
      path: '/article',
      options: {
        auth : false
      },
      handler: getArticles,
    },
    {
      method: 'POST',
      path: '/article/{judulSlug}',
      options: {
        auth : false
      },
      handler: getOneArticle,
    },
    {
      method: 'POST',
      path: '/chatbot',
      options: {
        auth : false
      },
      handler: chatBotBloomie,
    },
    // {
    //     method: 'POST',
    //     path: '/register',
    //     handler: registerUserHandler,
    // },
    // {
    //     method: 'GET',
    //     path: '/article',
    //     handler: getAllBooksHandler,
    // },
   
  ];
  
export { routes };
  