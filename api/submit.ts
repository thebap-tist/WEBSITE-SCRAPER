// api/submit.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const formData = req.body;
    
    // Attach your secret key safely on the server side!
    formData.access_key = process.env.WEB3FORMS_SECRET_KEY;

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
    
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}