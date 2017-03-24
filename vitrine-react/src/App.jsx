import React, {Component} from 'react';
import Featured from "./Featured"
import MyAwesomeReactComponent from './MyAwesomeReactComponent';
import {AuthenticationDetails, CognitoUserPool, CognitoUserAttribute, CognitoUser} from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';

const cogUserPoolId = 'us-east-1_CFgzYswbF';
const cogClientId = '7dst2a1oo83qccu3m0m72sq2s6';
const cogIdPoolId = 'us-east-1:41a89643-be20-4fd8-a9a3-346da49c0559';

class App extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            username: "",
            public_featured: [],
            private_featured: []
        }
    }

    render() {
        const {public_featured} = this.state
        return (
            <div>
              <input type="text" placeholder="email" defaultValue="jfaerman@gmail.com" ref={(input) => {
                    this.email = input
                }}/>
              <input type="text" placeholder="username" value={this.state.username} ref={(input) => {
                    this.username = input
                }}/>
              <input type="password" placeholder="password" defaultValue="Password-123" ref={(input) => {
                    this.password = input
                }}/>
              <button onClick={(e) => this.doLogin(e)}>Login</button>
              <button onClick={(e) => this.doRegister(e)}>Register</button>
              <br/>
              <input type="text" placeholder="code" ref={(input) => {this.code = input}} />
              <button onClick={(e) => this.doConfirm(e)}>Confirm</button>
              <MyAwesomeReactComponent/>
              <ul>
                    {public_featured.map(s => <Featured key={s.id} label={s.id}/>)}
              </ul>
            </div>
        );
    }

    doConfirm(event){
      const code = this.code.value;
      const username = this.username.value;
      console.log("Confirm "+code);
      var poolData = {
       UserPoolId : cogUserPoolId, // Your user pool id here
       ClientId : cogClientId // Your client id here
       };

       var userPool = new CognitoUserPool(poolData);
       var userData = {
           Username : username,
           Pool : userPool
       };

       var cognitoUser = new CognitoUser(userData);
       cognitoUser.confirmRegistration(code, true, function(err, result) {
           if (err) {
               console.error(err);
               return;
           }
           console.log(result);
       });

    }

    doRegister(event) {
        const that = this;
        const username = this.username.value;
        const password = this.password.value;
        const email = this.email.value;
        console.log("register user");
        var poolData = {
            UserPoolId: cogUserPoolId,
            ClientId: cogClientId
        };
        var userPool = new CognitoUserPool(poolData);

        var attributeList = [];

        var dataEmail = {
            Name: 'email',
            Value: email
        };

        // var dataPhoneNumber = {
        //     Name: 'phone_number',
        //     Value: '+15555555555'
        // };
        var attributeEmail = new CognitoUserAttribute(dataEmail);
        // var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

        attributeList.push(attributeEmail);
        // attributeList.push(attributePhoneNumber);

        userPool.signUp(username, password, attributeList, null, function(err, result) {
            if (err) {
                console.error(err);
                return;
            }
            let cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            that.setState({username:cognitoUser.getUsername()})
        });
    }

    doLogin(event) {
        const username = this.username.value;
        const password = this.password.value;
        console.log("doLogin " + username);

        var authenticationData = {
            Username: username,
            Password: password
        };
        var authenticationDetails = new AuthenticationDetails(authenticationData);
        var poolData = {
            UserPoolId: cogUserPoolId, // Your user pool id here
            ClientId: cogClientId // Your client id here
        };
        var userPool = new CognitoUserPool(poolData);
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                var creds = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: cogIdPoolId, // your identity pool id here
                    Logins: {
                        // Change the key below according to the specific region your user pool is in.
                        'cognito-idp.us-east-1.amazonaws.com/us-east-1_CFgzYswbF': result.getIdToken().getJwtToken()
                    }
                });
                AWS.config.credentials = creds;
                console.error(creds);


                // Instantiate aws sdk service objects now that the credentials have been updated.
                var s3 = new AWS.S3();
                s3.listBuckets();

            },

            onFailure: function(err) {
                console.error(err)
            }
        });

        event.preventDefault();
    }

    fetchPrivateFeatured() {
      var that = this;
      var poolData = {
        UserPoolId : cogUserPoolId, // Your user pool id here
        ClientId : cogClientId // Your client id here
      };
      var userPool = new CognitoUserPool(poolData);
      var cognitoUser = userPool.getCurrentUser();

      if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());

            // NOTE: getSession must be called to authenticate user before calling getUserAttributes
            cognitoUser.getUserAttributes(function(err, attributes) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(attributes);
                }
            });

            const creds = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : cogIdPoolId, // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_CFgzYswbF' : session.getIdToken().getJwtToken()
                }
            }, {region:"us-east-1" });
            console.log("xxxx");
            console.log(creds);

            creds.refresh(function(err,data){
              if(err) console.err(err);
              else{
                console.log("refreshed");
                console.log(creds.accessKeyId);
                console.log(creds.secretAccessKey);
                console.log(creds.sessionToken);

                var params = {
                  param0: 'param0Value',
                };

                var body = {
                  "someBody":"someBody"
                };

                var additionalParams = {
                  queryParams: {
                    param0: 'param0value',
                    param1: 'param1value'
                  }
                };

                var apigClient = window.apigClientFactory.newClient({
                  accessKey: creds.accessKeyId,
                  secretKey: creds.secretAccessKey,
                  sessionToken: creds.sessionToken
                });
                console.log(apigClient);
                apigClient.loadPrivateFeaturedGet(params, body, additionalParams)
                  .then(function(result){
                    console.log("WHEEEEE");
                    console.log(result.data);
                    that.setState(result.data);
                  }).catch( function(result){
                    console.error(result);
                  });

              }
            });
            // Instantiate aws sdk service objects now that the credentials have been updated.
            // example: var s3 = new AWS.S3();
            const lambda = new AWS.Lambda({
              region: "us-east-1",
              credentials: creds
            });
            var params = {
             //ClientContext: "MyApp",
             FunctionName: "load_private_featured",
             InvocationType: "RequestResponse",
             //LogType: "Tail",
            };
            // lambda.invoke(params, function(err, data) {
            //   console.log("Lambda Result");
            //   if (err) console.log(err, err.stack); // an error occurred
            //   else  {
            //     console.log(data);
            //     var payload = JSON.parse(data.Payload);
            //     var body = JSON.parse(payload.body);
            //     console.log(body);
            //     that.setState(body);
            //   }
            // });
        });
      }
    }

    fetchPublicFeaturedAPI(){
      var params = {
      };

      var body = {
      };

      var additionalParams = {
      };

      var apigClient = window.apigClientFactory.newClient();
      console.log(apigClient);
      var that = this;
      apigClient.loadFeaturedGet(params, body, additionalParams)
        .then(function(result){
          console.log(result.data);
          that.setState(result.data);
        }).catch( function(result){
          console.error(result);
        });
    }

    fetchPublicFeatured() {
        const url = "https://7v2h1zna5k.execute-api.us-east-1.amazonaws.com/production/load_featured";
        fetch(url).then(response => response.json()).then(data => this.setState(data));
    }

    componentDidMount() {
        //this.fetchPublicFeaturedAPI();
        this.fetchPrivateFeatured();
    }
}

export default App;
