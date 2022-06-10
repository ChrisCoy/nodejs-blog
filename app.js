const express = require("express");
const handlebars = require("express-handlebars");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const usuarios = require("./routes/usuarios");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");

//conexao ao BD
mongoose.Promise = global.Promise;
mongoose
  .connect(
    "mongodb+srv://blog:blogsenha@cluster1.lk71ful.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Conectado ao BD"))
  .catch((err) => console.log("Erro ao se conectar " + err));

//Configurações
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");

app.use(
  session({
    secret: "odeiojava",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//public config
app.use(express.static(path.join(__dirname, "public")));

//Rotas

app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ date: "desc" })
    .then((postagens) => {
      res.render("index", { postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro interno.");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem });
      } else {
        req.flash("error_msg", "Essa postagem não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Erro interno.");
      res.redirect("/");
    });
});

app.get("/posts", (req, res) => {
  res.send("Lista de posts");
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("categorias/index", { categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then((postagens) => {
            res.render("categorias/postagens", { postagens, categoria });
          })
          .catch((err) => {
            req.flash("error_msg", "Erro ao carregar postagens.");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Essa categoria não existe.");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Erro interno ao carregar página.");
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("<h1>Erro 404, página não encontrada.</h1>");
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);

app.get("/*", (req, res) => {
  res.redirect("/404");
});

//Outros
const PORT = 8081;
app.listen(PORT, () => console.log("IS ALIVE!!!!"));
