import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ExpandMore, HelpOutline, Security, BarChart, VerifiedUser, History } from '@mui/icons-material';

const Help = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const faqs = [
    {
      question: "How does VeritasAI verify content authenticity?",
      answer: "VeritasAI uses advanced AI algorithms to analyze content across multiple dimensions including source credibility, cross-referencing with trusted databases, metadata analysis, and pattern recognition to determine content authenticity."
    },
    {
      question: "What types of content can be verified?",
      answer: "VeritasAI can verify various content types including articles, images, videos, and social media posts. Simply provide the URL or upload the content for analysis."
    },
    {
      question: "How long does verification take?",
      answer: "Verification typically takes between 1-10 seconds depending on content complexity. Simple images may verify in under a second, while complex videos might take longer."
    },
    {
      question: "What do the verification results mean?",
      answer: "Results are categorized as 'Authentic' for verified genuine content, 'Suspicious' for content that raises concerns, and 'Pending' for content requiring additional analysis."
    },
    {
      question: "How accurate is the verification?",
      answer: "Our system maintains over 95% accuracy for most content types. Results are continuously improving through machine learning and user feedback."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all content is processed securely and deleted after verification. We never store or share your content without explicit permission."
    }
  ];

  const guides = [
    {
      title: "Getting Started",
      icon: <HelpOutline sx={{ color: theme.palette.primary.main }} />,
      steps: [
        "Create an account or log in",
        "Navigate to the Verification page",
        "Enter a URL or upload content",
        "Review the verification results"
      ]
    },
    {
      title: "Understanding Results",
      icon: <BarChart sx={{ color: theme.palette.secondary.main }} />,
      steps: [
        "Authentic: Content verified as genuine",
        "Suspicious: Content may be altered or misleading",
        "Pending: Additional analysis required"
      ]
    },
    {
      title: "Privacy & Security",
      icon: <Security sx={{ color: theme.palette.accent.main }} />,
      steps: [
        "All content is processed securely",
        "Data is deleted after verification",
        "No sharing without permission",
        "End-to-end encryption"
      ]
    }
  ];

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        py: isMobile ? 2 : 3,
        px: isMobile ? 2 : 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: isMobile ? 2 : 4 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.dark.main,
            }}
          >
            Help & Documentation
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            Find answers to common questions and learn how to use VeritasAI effectively
          </Typography>
        </Box>

        <Card 
          sx={{ 
            borderRadius: '0.75rem',
            mb: isMobile ? 2 : 3,
          }}
          role="region"
          aria-labelledby="getting-started-heading"
        >
          <CardContent>
            <Typography 
              variant="h6" 
              id="getting-started-heading"
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: theme.palette.dark.main,
              }}
            >
              Getting Started Guides
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={isMobile ? 2 : 3}>
              {guides.map((guide, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {guide.icon}
                        </ListItemIcon>
                        <Typography 
                          variant="h6"
                          sx={{ 
                            fontWeight: 'bold',
                            color: theme.palette.dark.main,
                          }}
                        >
                          {guide.title}
                        </Typography>
                      </Box>
                      
                      <List dense>
                        {guide.steps.map((step, stepIndex) => (
                          <ListItem key={stepIndex} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={step} 
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                color: 'text.primary'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            borderRadius: '0.75rem',
          }}
          role="region"
          aria-labelledby="faq-heading"
        >
          <CardContent>
            <Typography 
              variant="h6" 
              id="faq-heading"
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: theme.palette.dark.main,
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box>
              {faqs.map((faq, index) => (
                <Accordion 
                  key={index} 
                  sx={{ 
                    mb: 2,
                    borderRadius: '0.5rem',
                    '&:before': {
                      display: 'none',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls={`faq-content-${index}`}
                    id={`faq-header-${index}`}
                    sx={{
                      borderRadius: '0.5rem',
                      '&.Mui-expanded': {
                        minHeight: '48px',
                      },
                      '& .MuiAccordionSummary-content': {
                        margin: '12px 0',
                      },
                      '& .MuiAccordionSummary-content.Mui-expanded': {
                        margin: '12px 0',
                      },
                    }}
                  >
                    <Typography 
                      variant="subtitle1"
                      sx={{ 
                        fontWeight: 500,
                        color: theme.palette.dark.main,
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      pb: 3,
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary'
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            borderRadius: '0.75rem',
            mt: isMobile ? 2 : 3,
          }}
          role="region"
          aria-labelledby="support-heading"
        >
          <CardContent>
            <Typography 
              variant="h6" 
              id="support-heading"
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: theme.palette.dark.main,
              }}
            >
              Need Additional Help?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                color: 'text.primary'
              }}
            >
              If you can't find what you're looking for, our support team is here to help.
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                color: 'text.primary'
              }}
            >
              Contact us at: <strong>support@veritasai.com</strong>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Help;