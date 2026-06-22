const fs = require("fs");
const path = require("path");

function cleanSessionCache(sessionId) {

    try {

        const basePath = path.join(
            process.cwd(),
            ".wwebjs_auth",
            `session-${sessionId}`,
            "Default"
        );

        //Green flag -> Crashpad
        //red flag -> Cache" 
        const folders = [
            // "Cache", 
            // "Code Cache",
            // "GPUCache",
            // "ShaderCache",
            // "DawnCache",
            // "GrShaderCache",
            // "GraphiteDawnCache",
            "Crashpad"
        ];

        for (const folder of folders) {

            try {

                const folderPath =
                    path.join(
                        basePath,
                        folder
                    );

                if (
                    fs.existsSync(
                        folderPath
                    )
                ) {

                    fs.rmSync(
                        folderPath,
                        {
                            recursive: true,
                            force: true
                        }
                    );

                    console.log(
                        `[${sessionId}] Removed ${folder}`
                    );

                }

            } catch (err) {

                console.log(
                    `[${sessionId}] Skip ${folder}: ${err.code}`
                );

            }

        }

    } catch (err) {

        console.error(err);

    }

}

module.exports = cleanSessionCache;