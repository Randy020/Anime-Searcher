const fetch = require('node-fetch'),
      axios = require('axios')

class TraceMoe {
    constructor(token) {
        this.token = token;
    }

    async getImageBase64(url){
        return new Promise(async(resolve,reject)=>{
            try {
                let image = await axios.get(url, {responseType: 'arraybuffer'});
                let returnedB64 = Buffer.from(image.data, 'binary').toString('base64');
                resolve(returnedB64)
            } catch(err) {
                reject(err)
            }
        })
    }

    async search(imgBase64){
        return new Promise(async(resolve,reject)=>{
            try {
            let request = await fetch(`https://trace.moe/api/search${this.token ? '?token='+this.token : ''}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            image: imgBase64
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }})
            let result = await request.json()
            if(!result.limit || !result.docs.length) return reject('rate limit')
            resolve(this.sortAndUnique(result))
           } catch(err) {
                reject(err)
           }
        })
    }

    sortAndUnique(result){
        //unique
        let titleNames = [];
        let uniqued = []
        result.docs.map(e=>{
            if(!titleNames.includes(e.title_english)) {
                titleNames = [...titleNames,e.title_english];
                uniqued = [...uniqued,e]
               // console.log(titleNames)
            }
        })
        //sort
        uniqued.sort((a,b)=>{
            return b.similarity - a.similarity
        })
        result.docs = uniqued;
        return result
    }
}

module.exports = TraceMoe;