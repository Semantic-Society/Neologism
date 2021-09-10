export const environment = {
  production: true,
  recommender:{
    base:"http://localhost/recommender",
    port:"",
  },
  guestUserName: window["env"]["guser"] || "guest",
  guestPassword: window["env"]["gpass"] || "12345",
  gMaxVocab: window["env"]["gMaxlength"] || "5"
};
