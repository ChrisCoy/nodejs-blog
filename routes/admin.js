const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("../models/Categoria");
const Categoria = mongoose.model("categorias");

require("../models/Postagem");
const Postagem = mongoose.model("postagens");

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/posts", (req, res) => {
  res.send("Pagina de posts");
});

router.get("/categorias", (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao listar as categorias!");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", (req, res) => {
  var erros = [];

  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido!" });
  }
  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({ texto: "Slug inválido!" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch(() => {
        req.flash("error_msg", "Erro ao salvar categoria!");
      });
  }
});

router.get("/categorias/edit/:id", (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe");
      res.redirect("admin/categorias");
    });
});

router.post("/categorias/edit", (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso.");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao editar categoria.");
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao editar categoria");
      res.render("/categorias");
    });
});

router.post("/categorias/remove", (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso.");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao remover categoria.");
      res.redirect("/admin/categorias");
    });
});

router.get("/postagens", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ date: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao listar postagens.");
      res.redirect("/admin");
    });
});

router.get("/postagens/add", (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addpostagem", { categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulario");
      res.redirect("/admin");
    });
});

router.post("/postagens/nova", (req, res) => {
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria." });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.conteudo,
      categoria: req.body.categoria,
      conteudo: req.body.conteudo,
      slug: req.body.slug,
    };

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso.");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao criar postagem.");
        res.redirect("/admin/postagens");
      });
  }
});

router.get("/postagens/edit/:id", (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .populate("categoria")
    .sort({ date: "desc" })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          res.render("admin/editpostagem", { postagem, categorias });
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao listar categorias");
          res.redirect("admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa postagem não existe");
      res.redirect("admin/postagens");
    });
});

router.post("/postagens/edit", (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso.");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao editar postagem.");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao editar postagem");
      res.render("/postagens");
    });
});

router.post("/postagens/remove", (req, res) => {
  Postagem.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso.");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao remover postagem.");
      res.redirect("/admin/postagens");
    });
});

module.exports = router;
