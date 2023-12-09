const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

const app = express();

app.use(express.json());

const databasePath = path.join(__dirname, "cricketTeam.db");

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at https//localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API 1

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team;`;

  const playersArray = await database.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addingPlayer = `
            INSERT INTO 
                    cricket_team(player_name, jersey_number, role)
            VALUES
                ('${playerName}', '${jerseyNumber}', '${role}');                
    `;

  await database.run(addingPlayer);

  response.send("Player Added to Team");
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;

  const player = await database.get(getPlayerQuery);

  response.send(convertDbObjectToResponseObject(player));
});

//API 4

app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const { playerId } = request.params;

  const updatePlayerQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = '${jerseyNumber}',
            role = '${role}'
        WHERE
            player_id = '${playerId}';        
  `;

  await database.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;

  await database.run(deletePlayerQuery);

  response.send("Player Removed");
});

module.exports = app;
