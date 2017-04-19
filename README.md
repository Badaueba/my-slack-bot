# my-slack-bot
using slack api with Nodejs to make slack bots

# setup 

### On Slack

- Create a slack team : https://slack.com/ 
- Get your api token : https://my.slack.com/apps/build/custom-integration
- Add bot integration in your team
- Join bot on a channel

### On project 

  - paste your api token on  **token.config.js**
  ```
      module.exports = {
        token : '<your_api_token'
      }
   ```
 ### Run
 
  - npm install 
  - node index.js
