const id = "efa9039f84f0ffebbf6d"
const sec = "6cdb13cbc0565321835894bf09d99ae7d60d56d1"
const params = `?client_id=${id}&client_secret=${sec}`

function getErrorMsg(message, username) {
    if (message === 'Not Found') {
        return `${username} doesn't exist`
    }
    return message
}

function getProfile(username) {
    return fetch(`https://api.github.com/users/${username}${params}`)
        .then((res)=>res.json())
        .then((profile)=> {
            if(profile.message) {
                throw new Error(getErrorMsg(profile.message, username))
            }
            return profile
        })
}

function getRepos(username) {
    return fetch(`https://api.github.com/users/${username}/repos${params}&per_page=100`)
        .then((res) => res.json() )
        .then((repos)=> {
            if(repos.messsage) {
                throw new Error(getErrorMsg(repos.message, username))
            }
            return repos
        })
}

function getStarCount (repos) {
    return repos.reduce((count , {stargazers_count}) => count + stargazers_count , 0)
}

function calculateScore(followers, repos) {
    return (followers*3) + getStarCount(repos)

}

function getUserData (player) {
    return Promise.all([
        getProfile(player),
        getRepos(player)
    ]).then(( [profile, repos ]) => ({
        profile,
        score : calculateScore(profile.followers, repos)
    }))
}

function sortPlayers(players) {
    return players.sort((a,b) => b.score-a.score)
}

export function battle (players) {
    return Promise.all([
        getUserData(players[0]),
        getUserData(players[1])
    ]).then((results) => sortPlayers(results))
}

export function fetchPopularRepos (language) {
    const endpoint = window.encodeURI (`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`)

    return fetch(endpoint)
        .then((res)=> res.json())
        .then((data) => { 
            if (!data.items) {
                throw new Error(data.message)
            }

        return data.items

    })

}
