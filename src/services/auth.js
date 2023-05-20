import { axiosApi } from "http-common"


export class AuthService {
    static login = function (username, password, onsuccess, onfailure) {
        axiosApi.post("/users/login", { username, password })
            .then(function (token) {
                if (token.data) {

                    onsuccess && onsuccess(token)
                } else {
                    onfailure && onfailure()
                }

            })
            .catch(reason => {
                onfailure && onfailure(reason)
            })

    }
}
