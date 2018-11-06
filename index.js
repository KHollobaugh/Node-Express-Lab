const express = require('express');

const db = require('./data/db.js');

const cors = require('cors');

const server = express();

// server.use(cors({origin: 'http://localhost:9000'}));

server.use(express.json()); //teaches express how to parse the json request body

server.get('/', (req, res) => {
    res.json('alive');
});

server.get('/api/posts', (req, res) => {
    db.find().then(posts => {
        res.json(posts);
    })
    .catch(err => {
        res.status(500).json({ message: "The posts information could not be retrieved." });
    });
});

server.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    db.findById(id).then(post => {
        if(post.id) {
           res.status(200).json(post); 
        } else {
            res.status(404).json({message: "The post with the specified ID does not exist."  });
        }
        
    })
    .catch(err => {
        res.status(500).json({message: "The post information could not be retrieved." })
    });
});

// server.post('/api/posts', (req, res) => {
//     const postData = req.body;
//     db.insert(post)
//     .then(post => {
//     if (!title || !contents) {
//         res.status(400).json({message: "Please provide title and contents for the post."})
//     } else {
//         res.status(201).json({ url: '/api/posts', operation: 'POST' });
//     }          
// })
//     .catch(err => {
//         res.status(500).json({message: "There was an error while saving the post to the database"})
//     })
// });

server.post('/api/posts', async (req, res) => {
    console.log('body', req.body)
    try {
        const postData = req.body;
        const postId = await db.insert(postData);
        const post = await db.findById(postId.id)
        res.status(201).json(post)
    } catch (error) {
        let message = 'error creating post';
        if (error.errno === 19) {
            message = "Please provide title and contents for the post."
        }
        res.status(500).json({ message, error})
    }
})


server.delete('/api/posts/:id', (req, res) => {
    db.remove(req.params.id)
    .then(count => {
        res.status(200).json(count);
    })
    .catch(err => {
        res.status(500).json({ message: 'error deleting user' });
    })
})

server.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const changes = req.body;
    db.update(id, changes)
    .then(count => {
        if (count) {
           res.status(200).json({ message: `${count} post updated` }); 
        } else {
            res.status(404).json({ message: 'post not found' })
        }  
    })
    .catch(err => {
        res.status(500).json({ message: 'error updating post' });
    })
})


server.listen(9000, () => console.log('the server is alive!'));

