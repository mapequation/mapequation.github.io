---
title: "Cross-validation of correlation networks using modular structure"
authors: "Magnus Neuman, Viktor Jonsson, Joaquín Calatayud, Martin Rosvall"
year: 2022
date: "2022-11-15"
journal: "Applied Network Science 7, 75 (2022)"
doi: "https://doi.org/10.1007/s41109-022-00516-5"
arxiv: "2303.01835"
figure:
  caption: "Thresholding correlation networks. The researcher must solve a model selection problem when thresholding a correlation network, here exemplified by gene co-expression data from the plant Arabidopsis thaliana. As the threshold increases, more communities appear, potentially leading to overfitting (left). Including too many links (low threshold) can lead to underfitting (middle). Our module-based cross-validation method guides the researcher to the most parsimonious model (right)."
---

We propose a module-based cross-validation approach for thresholding correlation networks derived from multivariate data. By integrating modular structure into the sparsification process, the method addresses the challenge of balancing overfitting and underfitting. Tests on synthetic and real datasets show that its ability to recover a planted partition has a step-like dependence on the number of data samples, with diminishing gains beyond a critical threshold. Compared to the established WGCNA method, the approach reveals greater modular structure in the tested datasets.
