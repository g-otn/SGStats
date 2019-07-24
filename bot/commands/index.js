// This files requires all commands files so they can be simply accessed with require('this_file').commandFileName.someFunction
module.exports = {
    data: require('./data'),
    forums: require('./forums'),
    help: require('./help'),
    hue: require('./hue'),
    join: require('./join'),
    leaderboard: require('./leaderboard'),
    online: require('./online'),
    server: require('./server'),
    player: require('./player'),
    server: require('./server'),
    stats: require('./stats'),
    steaminfo: require('./steaminfo')
}