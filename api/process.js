import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the array from req.body and convert it to a typed array
    const { buffer } = req.body;
    const bytes = new Uint8Array(buffer);

    // Send the request to Textract
    const command = new AnalyzeDocumentCommand({
      Document: { Bytes: bytes },
      FeatureTypes: ['TABLES']
    });

    const response = await textract.send(command);
    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Increase body parser limit to handle larger files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
