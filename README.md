# dvsa-driving-test-bot

Auto refresh that page using a Tampermonkey script.

Avoid paying for any service that promises to secure you an earlier slot.

This script is capable of locating available slots before other methods and does so with enhanced security. All data is stored and processed locally, ensuring privacy.

However, there is one limitation: your machine must be on, and you will need to periodically interact with the reCAPTCHA system.

---

## Setup

- Install Tampermonkey extension (https://www.tampermonkey.net/) to Chrome
- Create a new user script in Tampermonkey
- Copy the content of dvsa.js to that new user script window
- Change some constant values in the js file
  - all these info will be stored locally and won't be shared
  - test centre id can be found by:
    - go to the dvsa driving test page;
    - enter your details, and find a test centre near your postcode;
    - inspect the test centre title with F12 Dev-tool
    - the id of the `div` is the test centre id
    - I could have used the test centre name there. But too late, I've passed the test :(
    - please create PR if you are willing to fix this
- Save the change

## Start refreshing the DVSA page

### Looking for new slots

- Go to https://driverpracticaltest.dvsa.gov.uk/application
- Enter your information
- Auto-filling is available
- Then the script will auto refreshing the page
- It will play alert sound when test centre has available slot

### Looking for short-noticed slots

- Go to https://driverpracticaltest.dvsa.gov.uk/manage
- Log in
- Click the short-noticed slot button
- Enter your postcode manually (auto-filling is not available, need somebody to fix this)
- Then the script will auto refreshing the page
- It will play alert sound when test centre has available slot

## TODO

- Auto-filling the postcode on the short-noticed page
- Configure test centre by name
- Support the configuration for test data
