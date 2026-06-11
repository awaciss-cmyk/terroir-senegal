// Dans la route de confirmation/création commande, ajouter les frais :
router.post('/', async (req, res) => {
  try {
    const { articles, paiement, client } = req.body;

    const montantArticles = articles.reduce((sum, a) => sum + a.sousTotal, 0);
    const fraisLivraison  = 500; // FCFA
    const montantTotal    = montantArticles + fraisLivraison;

    const commande = new Commande({
      articles,
      paiement,
      client,
      montantArticles,
      fraisLivraison,
      montantTotal
    });

    await commande.save();
    res.status(201).json({ success: true, commande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
