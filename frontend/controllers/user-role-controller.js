const backend_url = process.env.BACKEND_URL || "http://localhost:8000";
const cookie = require("cookie");
const session = require("express-session");
const { check, validationResult } = require("express-validator");

exports.getUsers = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/user/v1?action=all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      // console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });

    // On successful login, redirect to home or dashboard
    const users = data?.data;
    //   // console.log(users);
    res.render("dashboard/users", {
      activeTop: "users",
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      users,
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.postBanUser = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // // console.log("Access Token:", accessToken);
    const { user_id, app_id } = req.body;
    // // console.log(req.body);
    const response = await fetch(`${backend_url}/api/AaaS/user/v1?action=ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ app_id, user_id }),
    });
    if (!response.ok) {
      // console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });

    // On successful login, redirect to home or dashboard
    // const users = data?.data;
    //   // console.log(users);
    return res.redirect("/dashboard/users");
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.getBannedUsers = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/user/v1?action=banned`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      // console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });

    // On successful login, redirect to home or dashboard
    const bannedUsers = data?.data;
    // // console.log(bannedUsers);
    res.render("dashboard/banned-users", {
      activeTop: "banned-users",
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      bannedUsers,
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.postUnbanUser = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // // console.log("Access Token:", accessToken);
    const { user_id, app_id } = req.body;
    // console.log(req.body);
    const response = await fetch(`${backend_url}/api/AaaS/user/v1?action=unban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ app_id, user_id }),
    });
    if (!response.ok) {
      // console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });

    // On successful login, redirect to home or dashboard
    // const users = data?.data;
    //   // console.log(users);
    return res.redirect("/dashboard/users/banned");
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.getRoles = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/rbac/v1/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      // console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });
    const roles = data?.data;
      // console.log(roles);
    res.render("dashboard/roles", {
      activeTop: "roles",
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      roles,
    });
  } catch (err) {}
};
exports.postCreateRole = (req, res) => {
  try {
    const { app_id, app_name } = req.body;
    res.render("dashboard/create-role", {
      activeTop: "roles",
      app_id,
      app_name,
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      errors: [],
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.postCreatedRole = [
  check("role_name").trim().notEmpty().withMessage("Please enter role name"),
  check("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long")
    .matches(/^[a-zA-Z0-9\s.,!()-]+$/)
    .withMessage(
      "Description can only contain letters, numbers, and basic punctuation"
    ),
  (req, res, next) => {
    try {
      const { app_id, app_name } = req.body;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        // // console.log(error.array().map((err) => err.msg));
        return res.render("dashboard/create-role", {
          activeTop: "roles",
          app_id,
          app_name,
          activeSide: "overview",
          isLoggedIn: req.session?.isLoggedIn,
          errors: error.array().map((err) => err.msg),
        });
      } else {
        next();
      }
    } catch (error) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: error.message,
      });
    }
  },
  async (req, res) => {
    try {
      const { app_id, role_name, description } = req.body;
      // console.log(req.body);
      const cookies = cookie.parse(req.headers.cookie || "");

      const accessToken = cookies.access_token;
      // // console.log("Access Token:", accessToken);

      const response = await fetch(`${backend_url}/api/AaaS/rbac/v1/create/${app_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: role_name, description }),
      });
      if (!response.ok) {
        // console.log(response);
        return res.status(response.status).render("error/server-error", {
          errorCode: response.status,
          type: "error",
          message: err.message,
        });
      }

      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });

      // On successful login, redirect to home or dashboard
      // const users = data?.data;
      //   // console.log(users);
      return res.redirect("/dashboard/roles");
    } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      });
    }
  },
];
exports.postUpdateRolePage = (req, res) => {
    try {
const { role_id, name, description } = req.body;
const role = { name, description, role_id };
        return res.render("dashboard/update-role", {
          activeTop: "roles",
          role,
          activeSide: "overview",
          isLoggedIn: req.session?.isLoggedIn,
          errors:[] 
        });
    } catch (err) {
         return res.status(500).render("error/server-error", {
           errorCode: 500,
           type: "error",
           message: err.message,
         });
    }
}
exports.postUpdatedRole = [
  check("name").trim().notEmpty().withMessage("Please enter role name"),
  check("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long")
    .matches(/^[a-zA-Z0-9\s.,!()-]+$/)
    .withMessage(
      "Description can only contain letters, numbers, and basic punctuation"
    ),
  (req, res, next) => {
    try {
      const { role_id, name,description } = req.body;
      const role = { name, description,role_id };
      const error = validationResult(req);
      if (!error.isEmpty()) {
        // // console.log(error.array().map((err) => err.msg));
        return res.render("dashboard/update-role", {
          activeTop: "roles",
            role,
          activeSide: "overview",
          isLoggedIn: req.session?.isLoggedIn,
          errors: error.array().map((err) => err.msg),
        });
      } else {
        next();
      }
    } catch (error) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: error.message,
      });
    }
  },
  async (req, res) => {
    try {
        const { role_id, name, description } = req.body;
         const cookies = cookie.parse(req.headers.cookie || "");

         const accessToken = cookies.access_token;
         // // console.log("Access Token:", accessToken);

         const response = await fetch(
           `${backend_url}/api/AaaS/rbac/v1/update/${role_id}`,
           {
             method: "PUT",
             headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${accessToken}`,
             },
             body: JSON.stringify({  name, description }),
           }
         );
         if (!response.ok) {
           // console.log(response);
           return res.status(response.status).render("error/server-error", {
             errorCode: response.status,
             type: "error",
             message: err.message,
           });
         }

         const data = await response.json();
         if (!data)
           return res.status(503).render("error/server-error", {
             errorCode: 503,
             type: "error",
             message: "Service Unavailable. Please try again later.",
           });
         const roles = data?.data;
         // console.log(roles);
            return res.redirect("/dashboard/roles");
    } catch (error) {
        return res.status(500).render("error/server-error", {
          errorCode: 500,
          type: "error",
          message: error.message,
        });
    }
  }
];

exports.postRemoveRole = async (req, res) => {
    try {
        const { role_id } = req.body;
        const cookies = cookie.parse(req.headers.cookie || "");

        const accessToken = cookies.access_token;

        const response = await fetch(
            `${backend_url}/api/AaaS/rbac/v1/delete/${role_id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            return res.status(response.status).render("error/server-error", {
                errorCode: response.status,
                type: "error",
                message: err.message,
            });
        }

        const data = await response.json();
        if (!data)
            return res.status(503).render("error/server-error", {
                errorCode: 503,
                type: "error",
                message: "Service Unavailable. Please try again later.",
            });

        const roles = data?.data;
        // console.log(roles);
        return res.redirect("/dashboard/roles");
    } catch (error) {
        return res.status(500).render("error/server-error", {
          errorCode: 500,
          type: "error",
          message: error.message,
        });
    }
}

exports.postGetRolesByApp = async (req, res) => {
    try {
        const { app_id } = req.body;
        const cookies = cookie.parse(req.headers.cookie || "");

        const accessToken = cookies.access_token;

        // console.log(app_id);
        const response = await fetch(`${backend_url}/api/AaaS/rbac/v1/app/${app_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          return res.status(response.status).render("error/server-error", {
            errorCode: response.status,
            type: "error",
            message: err.message,
          });
        }

        const data = await response.json();
        if (!data)
          return res.status(503).render("error/server-error", {
            errorCode: 503,
            type: "error",
            message: "Service Unavailable. Please try again later.",
          });

        const roles = data?.data;
        // // console.log(roles);
        return res.status(200).json( roles );
    } catch (error) {
        return res.status(500).render("error/server-error", {
          errorCode: 500,
          type: "error",
          message: error.message,
        });
    }
}

exports.postAssignRole = async (req, res) => {
    try {
        const { app_id,user_id,role_id } = req.body;
        const cookies = cookie.parse(req.headers.cookie || "");

        const accessToken = cookies.access_token;

        // // console.log(app_id);
        const response = await fetch(`${backend_url}/api/AaaS/rbac/user/v1/add/${role_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ app_id,user_id}),
        });
        // console.log(response);
        if (!response.ok) {
          let data = await response.json();
          // console.log(data);
          return res.status(response.status).render("error/server-error", {
            errorCode: response.status,
            type: "error",
            message: data.message || response.statusText,
          });
        }

        // const data = await response.json();
        // if (!data)
        //   return res.status(503).render("error/server-error", {
        //     errorCode: 503,
        //     type: "error",
        //     message: "Service Unavailable. Please try again later.",
        //   });

        // const roles = data?.data;

        // // console.log(roles);
        return res.redirect("/dashboard/users");
    } catch (err) {
        return res.status(500).render("error/server-error", {
          errorCode: 500,
          type: "error",
          message: err.message,
        }); 
    }
}

exports.getAssignRolePage = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;

    // // console.log(app_id);
    const response = await fetch(`${backend_url}/api/AaaS/rbac/user/v1/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // console.log(response);
    if (!response.ok) {
      let data = await response.json();
      // console.log(data);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: data.message || response.statusText,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });

    const assignedUsers = data?.data;
    // // console.log(assignedUsers);
    return res.render("dashboard/assigned-role-use", {
      activeTop: "roles",
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      assignedUsers,
    });
  } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      }); 
  }
}

exports.postRemoveAssignedRoles = async (req, res) => {
  try {
     const { ur_id } = req.body;
     const cookies = cookie.parse(req.headers.cookie || "");

     const accessToken = cookies.access_token;

     // // console.log(app_id);
     const response = await fetch(
       `${backend_url}/api/AaaS/rbac/user/v1/remove/${ur_id}`,
       {
         method: "DELETE",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${accessToken}`,
         },
       }
     );
     // console.log(response);
     if (!response.ok) {
       let data = await response.json();
       // console.log(data);
       return res.status(response.status).render("error/server-error", {
         errorCode: response.status,
         type: "error",
         message: data.message || response.statusText,
       });
     }

    //  const data = await response.json();
    //  if (!data)
    //    return res.status(503).render("error/server-error", {
    //      errorCode: 503,
    //      type: "error",
    //      message: "Service Unavailable. Please try again later.",
    //    });

    //  const roles = data?.data;
    //  // console.log(roles);
      return res.redirect("/dashboard/Roles/assign");
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    }); 
  }
}
exports.postUpdateAssignedRoles = async (req, res) => {
  try {
     const { ur_id,role_id } = req.body;
     const cookies = cookie.parse(req.headers.cookie || "");

     const accessToken = cookies.access_token;

     // // console.log(app_id);
     const response = await fetch(
       `${backend_url}/api/AaaS/rbac/user/v1/update/${role_id}`,
       {
         method: "PUT",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${accessToken}`,
         },
         body: JSON.stringify({ ur_id }),
       }
     );
     // console.log(response);
     if (!response.ok) {
       let data = await response.json();
       // console.log(data);
       return res.status(response.status).render("error/server-error", {
         errorCode: response.status,
         type: "error",
         message: data.message || response.statusText,
       });
     }

     //  const data = await response.json();
     //  if (!data)
     //    return res.status(503).render("error/server-error", {
     //      errorCode: 503,
     //      type: "error",
     //      message: "Service Unavailable. Please try again later.",
     //    });

     //  const roles = data?.data;
     //  // console.log(roles);
     return res.redirect("/dashboard/Roles/assign");
  } catch (err) {
     return res.status(500).render("error/server-error", {
       errorCode: 500,
       type: "error",
       message: err.message,
     }); 
  }
}