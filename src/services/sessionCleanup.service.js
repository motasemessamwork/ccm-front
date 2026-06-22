const sessions = require("../storage/sessions");
const cleanSessionCache = require("../utils/cleanSessionCache");

function startSessionCleanup() {

    setInterval(() => {

        console.log(
            "Running session cleanup..."
        );

        Object.keys(sessions).forEach(id => {

            const session = sessions[id];

            if (
                session &&
                session.authenticated
            ) {

                cleanSessionCache(id);

            }

        });

    }, 30000);

}

module.exports = {
    startSessionCleanup
};