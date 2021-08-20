module.exports = (error, request, response, next) => {
    console.error(error)
     
    if (error.name === 'CastError') {
    response.status(400).send({error: 'id used is malformed'})
    } else if (error.name === 'JsonWebTokenError') {
        response.status(401).send({error: 'token missing or invalid'})
    } else if (error.name === 'TokenExpirerError') {
      response.status(401).send({error: 'token expired'})
 
    }
    
    else {
      response.status(500).end()
    }
  }