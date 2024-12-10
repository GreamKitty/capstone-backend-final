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
        handler: loginHandler,
    },
    {
        method: 'POST',
        path: '/register',
        
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
      method: 'GET',
      path: '/profile/{uid}',
      handler: getUsersHandler,
    },
    {
      method: 'POST',
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
      handler: getArticles,
    },
    {
      method: 'POST',
      path: '/article/{judulSlug}',
      handler: getOneArticle,
    },
    {
      method: 'POST',
      path: '/chatbot',
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
  