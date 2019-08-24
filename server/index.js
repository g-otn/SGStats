var app = require('express')()

app.use(require('./routes'))

app.listen(process.env.PORT, () => {
    console.log(`Express server running on port ${process.env.PORT}`)
})