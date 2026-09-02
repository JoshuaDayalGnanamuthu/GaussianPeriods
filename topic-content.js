window.TOPIC_PAGE_CONTENT = {
  "roots-of-unity": {
    title: "Roots of Unity",
    eyebrow: "Mathematical Foundation",
    description: "How evenly spaced points on a circle become the building blocks of every Gaussian period.",
    lead:
      "At first, roots of unity appear to be nothing more than evenly spaced points on a circle. A closer look reveals that the points multiply in a precise cycle. This shared structure is what allows their geometry to become the algebra behind Gaussian periods.",
    heroEquation: String.raw`\[
\mu_n = \{ z \in \mathbb{C} : z^n = 1 \} = \{ \zeta_n^k : 0 \leq k < n \},
\quad \zeta_n = e^{2\pi i / n}
\]`,
    heroCaption:
      "One primitive root generates every point, allowing modular arithmetic to keep track of the entire set.",
    summaryCards: [
      {
        title: "Exact Parametrization",
        body:
          "The equation \\(z^n=1\\) has exactly \\(n\\) solutions: \\(e^{2\\pi i k/n}\\) for \\(k=0,1,\\dots,n-1\\). Each step changes the angle by \\(2\\pi/n\\), placing the points at equal intervals on the unit circle."
      },
      {
        title: "Cyclic Group Structure",
        body:
          "Under multiplication, the roots form a cyclic group of order \\(n\\). Multiplying \\(\\zeta_n^a\\) by \\(\\zeta_n^b\\) adds their exponents modulo \\(n\\), so every product remains part of the same cycle."
      },
      {
        title: "Primitive Roots",
        body:
          "A root \\(\\zeta_n^k\\) is primitive when \\(\\gcd(k,n)=1\\). These are the roots that can generate the full cycle rather than a smaller one, and there are exactly \\(\\varphi(n)\\) of them."
      }
    ],
    detailCards: [
      {
        title: "From the equation to the circle",
        paragraphs: [
          "Begin with Euler's identity \\(e^{2\\pi i}=1\\). Dividing one complete turn into \\(n\\) equal angles gives the numbers \\(e^{2\\pi i k/n}\\), and raising any one of them to the \\(n\\)-th power returns to 1. These are all the roots of \\(x^n-1\\) in characteristic zero.",
          "The equation therefore has a visible shape: its roots are the vertices of a regular \\(n\\)-gon centered at the origin. This rotational balance is the first source of symmetry in a Gaussian-period plot."
        ],
        equation: String.raw`\[
\zeta_n^k = \cos\!\left(\frac{2\pi k}{n}\right) + i \sin\!\left(\frac{2\pi k}{n}\right)
\]`,
        caption:
          "The exponential formula records the same point that the sine, cosine, and circle describe geometrically."
      },
      {
        title: "Why the group is cyclic",
        paragraphs: [
          "Let \\(\\zeta_n=e^{2\\pi i/n}\\), one step around the circle. Repeating that step produces \\(1,\\zeta_n,\\zeta_n^2,\\dots,\\zeta_n^{n-1}\\), so a single root generates the whole set \\(\\mu_n\\).",
          "This changes a geometric movement into an arithmetic one. Instead of multiplying complex numbers directly, we can add their exponents modulo \\(n\\), creating a bridge between the circle and finite arithmetic."
        ],
        equation: String.raw`\[
\mu_n \cong \mathbb{Z}/n\mathbb{Z},
\qquad
\zeta_n^a \cdot \zeta_n^b = \zeta_n^{a+b}
\]`,
        caption:
          "The residue class of \\(k\\) and the point \\(\\zeta_n^k\\) describe the same step in two different languages."
      },
      {
        title: "Cyclotomic polynomials and fields",
        paragraphs: [
          "Not every root travels through the full cycle. The ones that do are the primitive roots, and together they are exactly the roots of the cyclotomic polynomial \\(\\Phi_n(x)\\). Over \\(\\mathbb{Q}\\), this polynomial is irreducible and has degree \\(\\varphi(n)\\).",
          "Adjoining any one primitive root to \\(\\mathbb{Q}\\) produces the cyclotomic field \\(\\mathbb{Q}(\\zeta_n)\\). Its degree is again \\(\\varphi(n)\\), while its Galois group records how the primitive roots can be exchanged without disturbing their rational relationships."
        ],
        equation: String.raw`\[
\Phi_n(x) = \prod_{\gcd(k,n)=1}\left(x-\zeta_n^k\right),
\qquad
[\mathbb{Q}(\zeta_n):\mathbb{Q}] = \varphi(n)
\]`,
        caption:
          "A primitive root builds the field, while the field keeps track of the symmetries shared by all primitive roots."
      },
      {
        title: "Why this matters for Gaussian periods",
        paragraphs: [
          "A Gaussian period is formed by selecting powers of \\(\\zeta_n\\) and adding them. Before we introduce cosets, traces, or minimal polynomials, every ingredient is already present in the set \\(\\mu_n\\).",
          "The visualizer follows this same process. Each image begins with the regular \\(n\\)-gon formed by the roots, then combines selected vertices into new points on the complex plane."
        ],
        equation: String.raw`\[
\eta = \sum_{x \in S} \zeta_n^x
\qquad \text{for a structured subset } S \subseteq \mathbb{Z}/n\mathbb{Z}
\]`,
        caption:
          "The roots provide the pieces; the structure of \\(S\\) determines how those pieces are brought together."
      }
    ],
    callout: {
      title: "A useful mental model",
      body:
        "Think of \\(\\zeta_n\\) as one measured step around the circle. The power \\(\\zeta_n^k\\) is the point reached after \\(k\\) steps. After \\(n\\) steps we return to the beginning, just as counting modulo \\(n\\) returns to zero."
    },
    example: {
      title: "Worked Example: n = 12",
      paragraphs: [
        "For \\(n=12\\), we begin with twelve equally spaced points \\(\\zeta_{12}^k\\). Only the exponents \\(1,5,7,11\\) are coprime to 12, so these four points are the primitive roots.",
        "Those four roots complete the full cycle and become the roots of \\(\\Phi_{12}(x)\\). As a result, the polynomial has degree \\(\\varphi(12)=4\\)."
      ],
      equation: String.raw`\[
\Phi_{12}(x)
= \left(x-\zeta_{12}\right)\left(x-\zeta_{12}^5\right)\left(x-\zeta_{12}^7\right)\left(x-\zeta_{12}^{11}\right)
= x^4 - x^2 + 1
\]`,
      bullets: [
        "All twelve points solve the same equation, \\(z^{12}=1\\).",
        "Only four complete the full cycle because only four residues modulo 12 are coprime to 12.",
        "Each primitive root generates the same cyclotomic field \\(\\mathbb{Q}(\\zeta_{12})\\)."
      ]
    },
    references: [
      {
        title: "NIST DLMF, Section 1.11(iv): Roots of Unity and of Other Constants",
        note: "This reference gives the explicit form of every root of \\(x^n-1\\).",
        url: "https://dlmf.nist.gov/1.11.iv"
      },
      {
        title: "NPTEL Galois Theory, Lecture 17: Cyclotomic Extensions I",
        note: "This lecture connects the cyclic-group viewpoint to primitive roots and cyclotomic polynomials.",
        url: "https://archive.nptel.ac.in/content/storage2/courses/111101001/modules/lec17/17.2.html"
      },
      {
        title: "NPTEL Galois Theory, Lecture 17: Computation of Cyclotomic Polynomials",
        note: "This lecture develops the product formula for \\(\\Phi_n(x)\\) and explains the corresponding Galois group.",
        url: "https://archive.nptel.ac.in/content/storage2/courses/111101001/modules/lec17/17.5.html"
      },
      {
        title: "Encyclopedia of Mathematics: Cyclotomic Field",
        note: "This article records the degree of a cyclotomic field and identifies its Galois group.",
        url: "https://encyclopediaofmath.org/wiki/Cyclotomic_field"
      }
    ]
  },
  "character-grouping": {
    title: "Character-based Grouping",
    eyebrow: "Mathematical Foundation",
    description: "How multiplicative cosets sort roots into the groups that form Gaussian periods.",
    lead:
      "A Gaussian period does not add roots at random. It begins by sorting their exponents into multiplicative cosets, with every exponent placed in one distinct group. Characters then recognize those same groups in a different language, connecting the partition to finite Fourier analysis.",
    heroEquation: String.raw`\[
G = (\mathbb{Z}/p\mathbb{Z})^\times,
\qquad
\eta_{aH} = \sum_{x \in aH} \zeta_p^x
\]`,
    heroCaption:
      "Choose a subgroup \\(H\\subseteq G\\). Each coset \\(aH\\) selects one group of powers to be added together.",
    summaryCards: [
      {
        title: "Classical Setup",
        body:
          "For a prime \\(p\\), the nonzero exponents form the cyclic group \\(G=(\\mathbb{Z}/p\\mathbb{Z})^\\times\\). Choosing a subgroup \\(H\\) separates this group into cosets, each containing the same number of exponents."
      },
      {
        title: "The Period Itself",
        body:
          "Each coset \\(aH\\) selects a set of roots, and their sum is one Gaussian period \\(\\eta_{aH}\\). Moving through every coset produces the complete collection of conjugate periods."
      },
      {
        title: "Why Characters Appear",
        body:
          "Characters of \\(G/H\\) can identify the coset containing a given exponent. They do not create a new partition; they provide a precise way to recognize the one already formed by \\(H\\)."
      }
    ],
    detailCards: [
      {
        title: "Cosets are the real partition",
        paragraphs: [
          "Begin with a subgroup \\(H\\subseteq G\\). Multiplying \\(H\\) by representatives \\(a_1,\\dots,a_m\\) produces disjoint cosets whose union is all of \\(G\\), where \\(m=[G:H]\\). No exponent is missed, and no exponent belongs to two cosets.",
          "Each coset then selects the roots in one Gaussian-period sum. When those sums are plotted, the visible clusters are not accidental; they come from this exact arithmetic partition of the exponents."
        ],
        equation: String.raw`\[
G = \bigsqcup_{j=1}^{m} a_j H,
\qquad
\eta_{a_jH} = \sum_{x \in a_jH} \zeta_p^x
\]`,
        caption:
          "The cosets work together like separate compartments: each exponent has one place, and together they fill \\(G\\)."
      },
      {
        title: "Where the characters enter",
        paragraphs: [
          "Now let \\(\\widehat{G/H}\\) be the character group of the quotient. The orthogonality of these characters gives an indicator that returns 1 for members of a chosen coset and 0 for everything outside it.",
          "Characters therefore do not replace the cosets. Instead, they encode the same grouping in a form that can be manipulated algebraically, much like a Fourier expansion records a signal through its component frequencies."
        ],
        equation: String.raw`\[
\mathbf{1}_{aH}(x)
= \frac{1}{|G/H|}
\sum_{\chi \in \widehat{G/H}} \chi\!\left(xa^{-1}H\right)
\]`,
        caption:
          "This is finite Fourier inversion: several character values combine to recover one exact coset."
      },
      {
        title: "Trace viewpoint and subfields",
        paragraphs: [
          "The same sum has a Galois-theoretic meaning. View \\(H\\) as a subgroup of \\(\\mathrm{Gal}(\\mathbb{Q}(\\zeta_p)/\\mathbb{Q})\\). Its automorphisms move \\(\\zeta_p\\) through the powers indexed by \\(H\\), so adding those conjugates gives a field trace.",
          "This trace does more than collect related roots. It generates the fixed field \\(\\mathbb{Q}(\\zeta_p)^H\\), turning the original grouping into a concrete element of an intermediate field."
        ],
        equation: String.raw`\[
\eta_H
= \sum_{\sigma \in H} \sigma(\zeta_p)
= \operatorname{Tr}_{\mathbb{Q}(\zeta_p)/\mathbb{Q}(\zeta_p)^H}(\zeta_p)
\]`,
        caption:
          "The trace gathers several conjugates from the full cyclotomic field into one element of a smaller fixed field."
      },
      {
        title: "How this matches the visualizer",
        paragraphs: [
          "In the visualizer, \\(\\omega\\) acts on an exponent by multiplication modulo \\(n\\). Repeating the action traces an orbit until it returns to a value already visited.",
          "When \\(\\omega\\) generates a subgroup of units, these orbits become the same kind of multiplicative classes used in the classical construction. The inputs may change, but the organizing idea remains the same."
        ],
        equation: String.raw`\[
j \mapsto \omega j \pmod n,
\qquad
\mathcal{O}(j) = \{ j, \omega j, \omega^2 j, \dots \}
\]`,
        caption:
          "One starting exponent produces one orbit, and the completed orbits organize the entire computation."
      }
    ],
    callout: {
      title: "Important nuance",
      body:
        "It is tempting to say that a character creates the groups, but the order matters. The classical construction first chooses subgroup cosets. Characters enter afterward as an equivalent language for detecting those cosets, while more general orbit decompositions need not come from one character at all."
    },
    example: {
      title: "Worked Example: quadratic split for p = 17",
      paragraphs: [
        "Take \\(p=17\\) and choose the subgroup \\(H\\) of quadratic residues in \\(G=(\\mathbb{Z}/17\\mathbb{Z})^\\times\\). Because \\(H\\) has index 2, the sixteen nonzero exponents split into two equal groups: residues and nonresidues.",
        "Each group selects eight roots for one period sum. Together, the two sums account for all primitive 17th roots of unity, while their balanced structure makes expressions such as \\(x_1x_2\\) much easier to study."
      ],
      equation: String.raw`\[
x_1 = \zeta^{3^0} + \zeta^{3^2} + \cdots + \zeta^{3^{14}},
\qquad
x_2 = \zeta^{3^1} + \zeta^{3^3} + \cdots + \zeta^{3^{15}}
\]`,
      bullets: [
        "The exponents in \\(x_1\\) are exactly the quadratic residues modulo 17.",
        "The exponents in \\(x_2\\) complete the partition as the quadratic nonresidues.",
        "Together the cosets fill \\(G\\), so their sums satisfy \\(x_1+x_2=-1\\)."
      ]
    },
    references: [
      {
        title: "NPTEL Galois Theory, Lecture 18: Cyclotomic Extensions II",
        note: "This lecture derives the trace formula and shows how the resulting period generates the fixed field.",
        url: "https://archive.nptel.ac.in/content/storage2/courses/111101001/modules/lec18/18.4.html"
      },
      {
        title: "Ben Lynn, Gaussian Periods",
        note: "These notes work through the 17th-root example by separating residues from nonresidues.",
        url: "https://crypto.stanford.edu/pbc/notes/numbertheory/gaussperiod.html"
      },
      {
        title: "arXiv:2308.05220, Visual Aspects of Gaussian Periods and Analogues",
        note: "This paper connects the trace-based definition of Gaussian periods to their visible geometry.",
        url: "https://arxiv.org/abs/2308.05220"
      },
      {
        title: "arXiv:2507.09303, The asymptotic Mahler measure of Gaussian periods",
        note: "This paper presents Gaussian periods as traces attached to subgroups of cyclotomic-field Galois groups.",
        url: "https://arxiv.org/abs/2507.09303"
      }
    ]
  },
  "minimal-polynomial": {
    title: "Minimal Polynomial",
    eyebrow: "Mathematical Foundation",
    description: "How one irreducible polynomial records a Gaussian period and all of its conjugates.",
    lead:
      "A point in the visualizer may look like a numerical approximation, but a Gaussian period is exact. It is an algebraic integer, and its minimal polynomial brings the period and all of its Galois conjugates into one irreducible equation with integer coefficients.",
    heroEquation: String.raw`\[
m_\eta(x)
= \prod_{\sigma(\eta)\ \mathrm{distinct}}
\left(x-\sigma(\eta)\right)
\]`,
    heroCaption:
      "Each distinct conjugate contributes one factor, so the completed product records the entire Galois orbit.",
    summaryCards: [
      {
        title: "What it means",
        body:
          "The minimal polynomial of \\(\\eta\\) is the unique monic irreducible polynomial \\(m_\\eta(x)\\in\\mathbb{Q}[x]\\) that satisfies \\(m_\\eta(\\eta)=0\\). It is the smallest exact rational equation obeyed by \\(\\eta\\)."
      },
      {
        title: "Where the roots come from",
        body:
          "Field automorphisms produce the conjugates of \\(\\eta\\). For a Gaussian period, these automorphisms multiply exponents, moving one coset to another and carrying the period sums with them."
      },
      {
        title: "Why coefficients are integral",
        body:
          "Each root of unity is an algebraic integer, and so is their sum. The minimal polynomial begins with rational coefficients, but this integrality forces every coefficient to be an ordinary integer."
      }
    ],
    detailCards: [
      {
        title: "Conjugates of a Gaussian period",
        paragraphs: [
          "Fix a prime \\(p\\), let \\(G=(\\mathbb{Z}/p\\mathbb{Z})^\\times\\), and choose \\(H\\subseteq G\\). The period \\(\\eta_H\\) adds the roots indexed by \\(H\\). Applying \\(\\sigma_a\\) replaces every exponent \\(h\\) with \\(ah\\), changing \\(H\\) into the coset \\(aH\\).",
          "As \\(a\\) moves through \\(G\\), the automorphisms move the original period through every coset period. These distinct sums form the complete Galois orbit of \\(\\eta_H\\)."
        ],
        equation: String.raw`\[
\sigma_a(\eta_H)
= \sum_{h \in H} \zeta_p^{ah}
= \eta_{aH}
\]`,
        caption:
          "Multiplication moves the exponents from one coset to another, and the period follows with them."
      },
      {
        title: "Building the minimal polynomial",
        paragraphs: [
          "Once the distinct conjugates are known, each one contributes a factor \\(x-\\eta_{aH}\\). Multiplying the factors gives the minimal polynomial. Its degree is the number of cosets, which is the index \\([G:H]\\).",
          "This is where Gaussian periods become especially useful. Instead of working with the entire cyclotomic polynomial, we can gather roots into structured sums and study a smaller polynomial whose degree matches the number of period classes."
        ],
        equation: String.raw`\[
m_{\eta_H}(x)
= \prod_{aH \in G/H}\left(x-\eta_{aH}\right),
\qquad
\deg m_{\eta_H} = [G:H]
\]`,
        caption:
          "The number of cosets determines both the number of conjugate periods and the degree of their polynomial."
      },
      {
        title: "Why the coefficients land in Z",
        paragraphs: [
          "Every conjugate period \\(\\eta_{aH}\\) is a sum of roots of unity and is therefore an algebraic integer. The coefficients of the product are symmetric combinations of these periods, so they remain algebraic integers.",
          "At the same time, the Galois action only rearranges the factors and leaves each coefficient unchanged. The coefficients are therefore rational. Since the only rational algebraic integers are ordinary integers, the polynomial lies in \\(\\mathbb{Z}[x]\\)."
        ],
        equation: String.raw`\[
m_{\eta_H}(x) \in \mathbb{Q}[x]
\cap
\overline{\mathbb{Z}}[x]
= \mathbb{Z}[x]
\]`,
        caption:
          "Two ideas work together: Galois symmetry gives rationality, while the roots of unity give integrality."
      },
      {
        title: "Relation to Gaussian-period computation",
        paragraphs: [
          "Gauss used relations among periods to break large cyclotomic equations into smaller pieces. The same idea remains valuable computationally: a minimal polynomial represents a period exactly, while a plotted decimal can only approximate it.",
          "Once the conjugates are known, their elementary symmetric functions give the coefficients. The polynomial is therefore an algebraic record of the same relationships that appear geometrically in the plot."
        ],
        equation: String.raw`\[
m_\eta(x)
= x^d - e_1 x^{d-1} + e_2 x^{d-2} - \cdots + (-1)^d e_d
\]`,
        caption:
          "Each coefficient combines the conjugate periods symmetrically, so no single conjugate is treated differently."
      }
    ],
    callout: {
      title: "A practical interpretation",
      body:
        "Think of the plotted point as a visible approximation and its minimal polynomial as the exact mechanism behind it. The chosen period is one root of that polynomial, while the other roots are its Galois companions."
    },
    example: {
      title: "Worked Example: p = 7 and a cubic period",
      paragraphs: [
        "Take \\(p=7\\) and the subgroup \\(H=\\{\\pm1\\}\\). Its two exponents select the period \\(\\eta=\\zeta_7+\\zeta_7^{-1}\\). Because \\(H\\) has index 3, there are three cosets and therefore three conjugate period sums.",
        "The other two sums are \\(\\zeta_7^2+\\zeta_7^5\\) and \\(\\zeta_7^3+\\zeta_7^4\\). Bringing all three together as factors produces the cubic polynomial below."
      ],
      equation: String.raw`\[
m_\eta(x)
= \left(x-(\zeta_7+\zeta_7^6)\right)
\left(x-(\zeta_7^2+\zeta_7^5)\right)
\left(x-(\zeta_7^3+\zeta_7^4)\right)
= x^3 + x^2 - 2x - 1
\]`,
      bullets: [
        "The three cosets of \\(H\\) produce a polynomial of degree 3.",
        "Its three roots are exactly the three conjugate period sums.",
        "The original period is also the real number \\(2\\cos(2\\pi/7)\\)."
      ]
    },
    references: [
      {
        title: "NPTEL Galois Theory, Lecture 18: Cyclotomic Extensions II",
        note: "This lecture brings together the orbit method, fixed fields, and the explicit cubic example for \\(p=7\\).",
        url: "https://archive.nptel.ac.in/content/storage2/courses/111101001/modules/lec18/18.4.html"
      },
      {
        title: "NPTEL Galois Theory, Lecture 17: Computation of Cyclotomic Polynomials",
        note: "This lecture explains how conjugate roots are organized inside a cyclotomic field.",
        url: "https://archive.nptel.ac.in/content/storage2/courses/111101001/modules/lec17/17.5.html"
      },
      {
        title: "arXiv:2507.09303, The asymptotic Mahler measure of Gaussian periods",
        note: "This paper gives a modern account of Gaussian periods through subfields and traces.",
        url: "https://arxiv.org/abs/2507.09303"
      },
      {
        title: "F. Thaine, Properties that characterize Gaussian periods and cyclotomic numbers",
        note: "This paper develops the normal-basis viewpoint and the structured orbit formed by conjugate periods.",
        url: "https://www.researchgate.net/publication/242447395_Properties_that_characterize_Gaussian_periods_and_cyclotomic_numbers"
      }
    ]
  }
};
