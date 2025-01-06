import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

const textract = new TextractClient({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default async function handler(req, res) {
  console.log("Incoming request method:", req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the body
    console.log("Request body keys:", Object.keys(req.body));
    
    const { buffer } = req.body;

    // Check if buffer is defined and has length
    if (!buffer || !Array.isArray(buffer)) {
      console.error("Buffer is missing or is not an array:", buffer);
      return res.status(400).json({ error: "No valid buffer data was provided" });
    }

    // Convert to typed array
    const bytes = new Uint8Array(buffer);
    console.log("bytes length:", bytes.length);

    // Build Textract command
    const command = new AnalyzeDocumentCommand({
      Document: { Bytes: bytes },
      FeatureTypes: ['TABLES']
    });

    // Send the request to Textract
    const response = await textract.send(command);
    console.log("Textract response received", JSON.stringify(response, null, 2));

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in Textract analyze document:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Increase body parser limit if large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
