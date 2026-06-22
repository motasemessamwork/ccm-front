require("dotenv").config();

require("./src/utils/processHandlers");

const app = require("./src/app");

const {
    startSessionCleanup
} = require("./src/services/sessionCleanup.service");

const {
    deleteAllSessions
} = require("./src/services/userSessionCleanup.service");

const PORT =
    process.env.PORT || 3000;

async function bootstrap() {

    await deleteAllSessions();

    // startSessionCleanup();

    app.listen(PORT, "0.0.0.0", () => {

        console.log(
            `API STARTED ON PORT ${PORT}`
        );

    });

}

bootstrap().catch(err => {

    console.error(
        "Startup Error:",
        err
    );

});