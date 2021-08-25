<p align="center">
  <img src="https://github.com/labormedia/transactions-visualization-example/raw/main/assets/landing.png" width="320" alt="Example Screenshot" />
</p>

## Description

Getting started with Realtime Transaction Visualization through Web3's json-rpc Provider's Websocket Communication.
This basic example uses a json-rpc stack manager for gathering the requests to json-rpc and comply with usage requests limits you could have.
The visualization shows a grid of origin and target addresses of recent transactions, and the tiles colors represent how frequent was that particular origin:recipient pair in the pool of vert recent transactions.  

## Installation

Clone the git repository:
```
git clone https://github.com/labormedia/transactions-visualization-example.git
```

Create a .env file on the root folder of this project, with the following information from your provider:

```
WEB3_TYPE=wss://            # ws:// or wss://
WEB3_PROVIDER=@url          # with @
WEB3_USERNAME=XXXXXXXXXXX   # your providers's username
WEB3_PASSWORD=XXXXXXXXXXX   # your providers's password
```

## install dependencies

`npm install`

## run

`npm run dev`


## TODO:

- Define and limit the buffer size for fixed visualization size of the bin data. 
- Add more bin visualization types.