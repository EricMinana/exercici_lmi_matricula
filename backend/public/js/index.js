// form.js

// Definim un JSON de mòduls per cicle i curs
const moduls = {
    DAM: {
        1: ["Programació",
            "Bases de Dades",
            "Sistemes Informàtics",
            "Entorns de Desenvolupament",
            "Llenguatges de Marques i Sistemes de Gestió de la Informació",
            "Projecte Intermodular I",
            "Anglès Professional I",
            "Itinerari Personal per a l'Ocupabilitat I"],
        2: ["Accés a Dades", 
            "Desenvolupament d'Interfícies", 
            "Programació Multimèdia i Dispositius mòbils",
            "Programació de Serveis i Processos",
            "Sistemes de Gestió Empresarial",
            "Projecte Intermodular II",
            "Itinerari Personal per a l'Ocupabilitat II"]
    },
    DAW: {
        1: ["Programació",
            "Bases de Dades",
            "Sistemes Informàtics",
            "Entorns de Desenvolupament",
            "Llenguatges de Marques i Sistemes de Gestió de la Informació",
            "Projecte Intermodular I",
            "Anglès Professional I",
            "Itinerari Personal per a l'Ocupabilitat I"],
        2: ["Desenvolupament Web en entorn client",
            "Desenvolupament web en entorn servidor", 
            "Desplegament d'aplicacions web",
            "Disseny d'interfícies web",
            "Projecte Intermodular II",
            "Itinerari Personal per a l'Ocupabilitat II"]
    }
};

// Referències als elements del formulari
const cicleSelect = document.getElementById('cicle');
const cursRadios = document.getElementsByName('curs');
const modulsFieldset = document.getElementById('modulsFieldset');
const form = document.getElementById('matriculaForm');

// Funció per actualitzar els mòduls
function actualitzarModuls() {
    const cicle = cicleSelect.value;
    const curs = [...cursRadios].find(radio => radio.checked)?.value;

    if (!cicle || !curs) return;

    // Netegem els mòduls anteriors
    modulsFieldset.innerHTML = '<legend>Mòduls</legend>';
    const llistaModulsDiv = document.createElement('div');
    llistaModulsDiv.classList.add("llistaModuls");
    modulsFieldset.appendChild(llistaModulsDiv);

    // Generem els checkboxes dels mòduls
    const llistaModuls = moduls[cicle][curs];
    llistaModuls.forEach(nomModul => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'moduls';
        checkbox.value = nomModul;

        label.appendChild(checkbox);
        label.append(' ' + nomModul);
        llistaModulsDiv.appendChild(label);
        llistaModulsDiv.appendChild(document.createElement('br'));
    });
}

// Escoltem canvis en la selecció de cicle/curs
cicleSelect.addEventListener('change', actualitzarModuls);
cursRadios.forEach(radio => radio.addEventListener('change', actualitzarModuls));

// Enviar el formulari
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Prepara un objecte JSON amb la informació del formulari
    const dades = {
        nom: formData.get('nom'),
        cognoms: formData.get('cognoms'),
        email: formData.get('email'),
        adreca: formData.get('adreca'),
        telefon: formData.get('telefon'),
        cicle: formData.get('cicle'),
        curs: formData.get('curs'),
        moduls: formData.getAll('moduls')
    };

    console.log("Dades a enviar:", dades);

    // Enviament POST a backend
    const resposta = await fetch('/enviar-matricula', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dades)
    });

    const blob = await resposta.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "matricula.pdf"; // PDF descargado
    a.click();
});
