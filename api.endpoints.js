const API = {
    base: "https://ccm-production-023d.up.railway.app",

    auth: {
        login: "/sessions/login",
        signup: "/sessions/signup",
        logout: "/sessions/logout"
    },

    whatsapp: {
        status: "/sessions/status",
        qr: "/sessions/qr/page",
        send: "/sessions/send",
        sendFile: "/sessions/send-file"
    },

    groups: {
        list: "/sessions/groups",
        send: "/sessions/send-group",
        sendFile: "/sessions/send-group-file"
    },

    session: {
        checkAuth: "/sessions/check-auth"
    }
};