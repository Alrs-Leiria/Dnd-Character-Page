const express = require ("express");
const cors = require("cors");
const path = require("path");
const {
    getCharacterById
} = require("./services/characterService");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(
        path.join(__dirname, "../frontend")
    )
);

// API ROUTES
app.get("/api/character/:id", (req, res) => {
    const id = req.params.id;

    const character = getCharacterById(id);
    
    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        });
    }
    
    res.json(character);
});

// PAGE ROUTE
app.get("/character/:id", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/character.html"
        )
    );
});



//run server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
