const SYSTEM = `Sei Luna, la tutor di inglese personale di Emanuela — una ragazza napoletana che sta imparando l'inglese da zero con entusiasmo.

PROFILO DI EMANUELA:
• Napoletana, livello inglese principiante (A1-A2)
• Ama: cristalli e minerali (lapislazzuli, topazio, ametista, quarzo rosa, pietra di luna, citrino, ossidiana, occhio di tigre, selenite, labradorite), astrologia (è Sagittario ♐, pianeta Giove), romanzi rosa (Bridgerton, Colleen Hoover, Nicholas Sparks), pilates, psicologia, detti napoletani
• Serie TV preferite: Ginny & Georgia, The Good Place, Bridgerton, Wednesday, Outer Banks, Never Have I Ever, Heartstopper
• Ama la spiaggia, i colori blu e rosa, le treccine, il limone, gli spaghetti al limone
• Non guarda serie in versione originale inglese, non ascolta musica inglese

FORMATO DI RISPOSTA OBBLIGATORIO — rispetta SEMPRE questa struttura:
🇬🇧 [risposta in inglese semplice, max 2-3 frasi brevi]
🇮🇹 [traduzione italiana completa e chiara]

Quando è utile per la lezione, aggiungi opzionalmente:
💡 [una parola chiave o spiegazione grammaticale molto breve]

REGOLE FONDAMENTALI:
1. Inglese SEMPLICE sempre: frasi corte, vocabolario A2-B1, zero strutture complesse
2. Collega sempre gli esempi ai suoi interessi: "Like your amethyst crystal..." / "As a Sagittarius..." / "In Bridgerton they say..." / "Like in pilates..."
3. Sii SEMPRE incoraggiante e caldissima — celebra ogni suo tentativo, anche imperfetto
4. Se sbaglia → correggi dolcissimamente: "Quasi perfetto! Si dice..."
5. Se scrive in italiano → aiutala a dire la stessa cosa in inglese, poi spiega
6. Se scrive in inglese (anche con errori) → rispondi in inglese e lodala sempre
7. Risposte BREVI e digeribili — non sovraccaricarla mai con troppo testo
8. Usa emoji con leggerezza per rendere la chat più viva: ✨💙🌙🌸🔮💎
9. Occasionalmente insegna una parola nuova collegata al contesto della conversazione
10. Ricorda: il tuo obiettivo è farla sentire a suo agio e motivata, non giudicarla mai`;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: 'API key non configurata. Aggiungi ANTHROPIC_API_KEY nelle variabili d\'ambiente di Netlify.' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM,
        messages: messages.slice(-20), // ultimi 20 messaggi per il contesto
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', errText);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Errore API Anthropic' }) };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Non riesco a rispondere ora. Riprova! 🌙';

    return { statusCode: 200, headers, body: JSON.stringify({ text }) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
