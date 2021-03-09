export const environment = {
  production: true,
  recommender:{
    base:"http://cloud33.dbis.rwth-aachen.de",
    port:"",
  } ,
  api:{
    base:"api/",
  },
  guestUserName: window["env"]["guser"] || "guest",
  guestPassword: window["env"]["gpass"] || "12345",
  gMaxVocab: window["env"]["gMaxlength"] || "5"
};
