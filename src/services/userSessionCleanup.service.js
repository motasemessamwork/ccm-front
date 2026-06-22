const fs = require("fs");
const path = require("path");

const sessions =
    require("../storage/sessions");

async function deleteUserSessions(
    userId
) {

    const prefix =
        `name-${userId}-`;

    const sessionIds =
        Object.keys(sessions)
            .filter(id =>
                id.startsWith(prefix)
            );

    for (const sessionId of sessionIds) {

        const session =
            sessions[sessionId];

        try {

            // if (
            //     session &&
            //     session.initializing
            // ) {

            //     console.log(
            //         `[${sessionId}] Skip (initializing)`
            //     );

            //     continue;

            // }

            if (
                session &&
                session.client &&
                !session.initializing
            ) {

                console.log(
                    `[${sessionId}] Destroying client`
                );

                await session.client.destroy();

                // Give Chrome time to release files
                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            3000
                        )
                );

            }

        } catch (err) {

            console.error(
                `[${sessionId}] Destroy Error:`,
                err.message
            );

        }

        // Remove from memory
        delete sessions[sessionId];

        try {

            console.log("sessionId num:::", sessionId);


            const folder =
                path.join(
                    process.cwd(),
                    ".wwebjs_auth",
                    `session-${sessionId}`
                );

            console.log("Folder Path:", folder);
            console.log("Exists:", fs.existsSync(folder));

            if (
                fs.existsSync(folder)
            ) {

                console.log(
                    `[${sessionId}] Deleting folder`
                );

                fs.rmSync(
                    folder,
                    {
                        recursive: true,
                        force: true
                    }
                );

            }

        } catch (err) {

            console.error(
                `[${sessionId}] Folder Delete Error:`,
                err.message
            );

        }

    }

    return sessionIds;

}

async function deleteAllSessions() {

    const sessionIds =
        Object.keys(sessions);

    for (const sessionId of sessionIds) {

        const session =
            sessions[sessionId];

        try {

            if (
                session &&
                session.client &&
                !session.initializing
            ) {

                console.log(
                    `[${sessionId}] Destroying client`
                );

                await session.client.destroy();

            }

        } catch (err) {

            console.error(
                `[${sessionId}] Destroy Error:`,
                err.message
            );

        }

        delete sessions[sessionId];

    }

    const folders = [
        ".wwebjs_auth",
        ".wwebjs_cache"
    ];

    for (const folderName of folders) {

        try {

            const folder =
                path.join(
                    process.cwd(),
                    folderName
                );

            if (
                fs.existsSync(folder)
            ) {

                console.log(
                    `Deleting ${folderName}`
                );

                fs.rmSync(
                    folder,
                    {
                        recursive: true,
                        force: true,
                        maxRetries: 10,
                        retryDelay: 1000
                    }
                );

            }

        } catch (err) {

            console.error(
                `Delete ${folderName} Error:`,
                err.message
            );

        }

    }

    return true;

}

module.exports = {
    deleteUserSessions, deleteAllSessions
};