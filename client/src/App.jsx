import React, { useState, useEffect } from 'react';
import { SHA256 } from 'crypto-js';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Web3 from 'web3';
import SimpleStorage from './contracts/SimpleStorage.json';
import { PDFDocument, rgb } from 'pdf-lib';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const App = () => {
  // State variables
  const [email, setEmail] = useState(''); // Stores the email value entered in the form
  const [returnHash, setReturnHash] = useState(''); // Stores the hash of the certificate
  const [loading, setLoading] = useState(false); // Indicates if the PDF is being loaded
  const [pdfUrl, setPdfUrl] = useState(null); // Stores the URL of the modified PDF with watermark
  const [web3, setWeb3] = useState(null); // Stores the Web3 instance
  const [contract, setContract] = useState(null); // Stores the contract instance
  const [submitClicked, setSubmitClicked] = useState(false); // Indicates if the form submit button was clicked

  // Load blockchain
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
        const web3 = new Web3(provider);
        console.log(web3); // Assign the Web3 instance to the 'web3' state variable
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SimpleStorage.networks[networkId];
        const contractAddress = deployedNetwork.address;

        const contract = new web3.eth.Contract(SimpleStorage.abi, contractAddress);
        // console.log(contract); // Assign the contract instance to the 'contract' state variable
        setWeb3(web3);
        setContract(contract);
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      }
    };

    loadBlockchainData();
  }, []);

  // Fetch PDF with watermark
  useEffect(() => {
    const fetchPdfWithWatermark = async () => {
      try {
        const response = await fetch(`http://localhost:8080/${returnHash}.pdf`);
        if (response.ok) {
          const pdfBytes = await response.arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const pages = pdfDoc.getPages();
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { height } = page.getSize();
            const textWidth = 12; // Adjust the width of the watermark text
            const textHeight = height / 2; // Position the watermark at the center left
            const leftMargin = 20; // Adjust the left margin

            page.drawText(returnHash, {
              x: textWidth + leftMargin,
              y: textHeight,
              size: 12,
              color: rgb(1, 0, 0), // Set the color to red (full intensity for the red component)
              opacity: 0.5,
            });
          }
          const modifiedPdfBytes = await pdfDoc.save();
          const modifiedPdfUrl = URL.createObjectURL(new Blob([modifiedPdfBytes], { type: 'application/pdf' }));
          setPdfUrl(modifiedPdfUrl); // Assign the modified PDF URL to the 'pdfUrl' state variable
        } else {
          throw new Error('Failed to fetch PDF with watermark');
        }
      } catch (error) {

      } finally {
        setLoading(false); // Set the 'loading' state variable to false
      }
    };

    const checkHash = async () => {
      try {
        setLoading(true); // Set the 'loading' state variable to true

        if (email !== '') {
          const result = await contract.methods.checkHash(SHA256(email).toString()).call();
          setReturnHash(result); // Assign the result of hash checking to the 'returnHash' state variable

          if (result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            fetchPdfWithWatermark();
          }
        }
      } catch (error) {
        console.error('Error checking hash:', error);
      } finally {
        setLoading(false); // Set the 'loading' state variable to false
      }
    };

    if (submitClicked && contract && web3 && email !== '') {
      checkHash();
    }
  }, [email, contract, web3, returnHash, submitClicked]);

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitClicked(true); // Set the 'submitClicked' state variable to true
  };

  // Reset form and relevant state
  const resetPage = () => {
    setEmail(''); // Clear the email input value
    setReturnHash(''); // Clear the 'returnHash' state variable
    setLoading(false); // Set the 'loading' state variable to false
    setPdfUrl(null); // Clear the 'pdfUrl' state variable
    setSubmitClicked(false); // Set the 'submitClicked' state variable to false
  };

  return (
    <div className="app-container">
      {/* Heading */}
      <h2 className="heading">Enter your Email to Download Certificate</h2>
      {/* Form */}
      <Form onSubmit={handleSubmit} className="form-container">
        <Row className="align-items-center">
          <Col xs={3}>
            <Form.Label>Email</Form.Label>
          </Col>
          <Col xs={6}>
            <Form.Control type="text" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" onClick={resetPage} />
          </Col>
          <Col xs={3}>
            <Button variant="primary" type="submit" className="form-button">
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
      {/* Display certificate hash if available */}
      {submitClicked && returnHash !== '' && (
        <div className="message-container">
          <p className="message">Hash of certificate: {returnHash}</p>
        </div>
      )}
      {/* Display message if email address is not present */}
      {!loading && submitClicked && returnHash === '' && email !== '' && (
        <div className="message-container">
          <p className="message">Email Address not Present</p>
        </div>
      )}
      {/* Display loading message or embedded PDF */}
      {loading ? (
        <p className="loading">Loading PDF...</p>
      ) : (
        <>
          {submitClicked && pdfUrl && (
            <div className="pdf-container">
              <embed src={pdfUrl} width="500" height="400" type="application/pdf" className="pdf-embed" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
