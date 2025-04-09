import React, { useState } from 'react';
import {
  Box, Grid, Typography, Button, Card, Chip,
  CardContent, CardActions, IconButton, TextField,
  Slider, Pagination, ToggleButton, ToggleButtonGroup,
  Collapse, Divider, Rating
} from '@mui/material';
import {
  BookmarkBorder, Bookmark, ShoppingCart, Search,
  KeyboardArrowDown, KeyboardArrowUp
} from '@mui/icons-material';
// Import the standalone TestDetailsModal component
import TestDetailsModal from '../components/TestDetailsModal';// Adjust the path as needed

const medicalBackground = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <!-- Анимированный стетоскоп -->
    <path d="M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60" stroke="#0A3D2F" stroke-width="2" fill="none">
      <animate attributeName="d" 
        values="M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60;
                M50,20 Q65,22 65,32 T75,42 L75,52 Q75,62 70,62;
                M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60" 
        dur="5s" repeatCount="indefinite"/>
    </path>
    
    <!-- Пульсирующий крест -->
    <g transform="translate(25,25)">
      <rect x="-3" y="-10" width="6" height="20" fill="green">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="-10" y="-3" width="20" height="6" fill="green">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
    </g>
    
    <!-- Вращающаяся молекула -->
    <g transform="translate(75,25)">
      <circle cx="0" cy="0" r="3" fill="#E3A700">
        <animate attributeName="r" values="3;4;3" dur="3s" repeatCount="indefinite"/>
      </circle>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/>
        <circle cx="0" cy="-8" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="8" cy="0" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="0" cy="8" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="-8" cy="0" r="2" fill="#E3A700" opacity="0.8"/>
      </g>
    </g>
    
    <!-- Движущиеся капсулы -->
    <g transform="translate(20,70)">
      <ellipse cx="0" cy="0" rx="10" ry="5" fill="#0A3D2F" opacity="0.7">
        <animate attributeName="rx" values="10;12;10" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="5;6;5" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <animateTransform attributeName="transform" 
        type="translate" 
        from="20,70" 
        to="80,70" 
        dur="15s" 
        repeatCount="indefinite"
        additive="sum"/>
    </g>
    
    <!-- Пульсирующая сердечная линия -->
    <polyline points="10,85 15,85 20,65 25,95 30,85 35,85" 
      stroke="#FF8C00" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="points" 
        values="10,85 15,85 20,65 25,95 30,85 35,85;
                10,85 15,85 20,75 25,85 30,85 35,85;
                10,85 15,85 20,65 25,95 30,85 35,85" 
        dur="1.5s" 
        repeatCount="indefinite"/>
    </polyline>
    
    <!-- Движущиеся ДНК спирали -->
    <path d="M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80" 
      stroke="#E3A700" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="d" 
        values="M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80;
                M85,40 C80,45 80,55 85,60 C90,65 90,75 85,80;
                M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80" 
        dur="6s" 
        repeatCount="indefinite"/>
    </path>
    <path d="M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80" 
      stroke="#0A3D2F" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="d" 
        values="M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80;
                M80,40 C85,45 85,55 80,60 C75,65 75,75 80,80;
                M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80" 
        dur="6s" 
        repeatCount="indefinite"/>
    </path>
  </svg>
`;

const allLaboratories = [
  'Invivo', 'Sapalab', 'KDL Olymp', 'HealthCity', 'СУНКАР', 
  'Медикер', 'Олимп Клиник', 'ДАМУ', 'Медицинский центр ЮРФА',
  'СЕНІМ', 'Шипагер', 'EuroLab', 'LabStory', 'МедЭксперт',
  'Авиценна', 'БиоМед', 'Гемотест', 'ДНК-лаборатория',
  'Лаборатория ЦИР', 'Прогрессивные Медицинские Технологии'
];

const allCategories = [
  'Hematology', 'Hormones', 'Infections', 'Allergology',
  'Vitamins & Micronutrients', 'Oncology markers', 'Biochemistry',
  'Immunology', 'Coagulology', 'Genetic research',
  'Parasitology', 'Histology', 'Cytology', 'PCR diagnostics',
  'Autoimmune diseases', 'Toxicology', 'Microbiology',
  'Endocrinology', 'Cardiology', 'Nephrology', 'Gastroenterology'
];

const turnaroundTimes = ['Within 24 hours', '1-3 days', 'More than 3 days'];

const testData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Medical Test ${i + 1}`,
  lab: allLaboratories[Math.floor(Math.random() * allLaboratories.length)],
  category: allCategories[Math.floor(Math.random() * allCategories.length)],
  price: Math.floor(Math.random() * 40000) + 1000,
  ready: ['Within 1 day', '1-3 days', 'More than 3 days'][Math.floor(Math.random() * 3)],
  description: "A comprehensive blood test that measures various markers to assess your health status.",
  rating: (Math.random() * 2 + 3).toFixed(1),
  reviews: Math.floor(Math.random() * 5000) + 100,
  reviewsData: [
    {
      author: "Ardak Aruzhan",
      date: "1 Jan",
      rating: 5,
      text: "I had a Vitamin D test done painless. I received the result quickly."
    },
    {
      author: "Alex Smith",
      date: "15 Feb",
      rating: 4,
      text: "Good service but waiting time was longer than expected."
    }
  ]
}));

const FilterSection = ({ title, items, selected, onChange, color = 'success' }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" fontWeight={600} color="white">{title}</Typography>
        <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: 'white' }}>
          {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>
      
      <Collapse in={!expanded} collapsedSize={selected.length ? 'auto' : '0px'}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {selected.map(item => (
            <Chip
              key={item}
              label={item}
              color={color}
              variant="filled"
              onDelete={() => onChange(item)}
              sx={{ mb: 1, color: 'white' }}
            />
          ))}
        </Box>
      </Collapse>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {items.map(item => (
            <Chip
              key={item}
              label={item}
              clickable
              color={selected.includes(item) ? color : 'default'}
              variant={selected.includes(item) ? 'filled' : 'outlined'}
              onClick={() => onChange(item)}
              sx={{ 
                mb: 1,
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white'
                }
              }}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

const CatalogPage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [selectedTurnaround, setSelectedTurnaround] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 40000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('priceAsc');
  const [page, setPage] = useState(1);
  const [selectedTest, setSelectedTest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 9;

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTest(null);
  };

  const handleFilterChange = (filter, item) => {
    const filterMap = {
      categories: setSelectedCategories,
      labs: setSelectedLabs,
      turnaround: setSelectedTurnaround
    };
    filterMap[filter](prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
    setPage(1); // Reset to first page when filters change
  };

  const filteredTests = testData.filter(test => {
    const matchesCategory = !selectedCategories.length || selectedCategories.includes(test.category);
    const matchesLab = !selectedLabs.length || selectedLabs.includes(test.lab);
    const matchesTurnaround = !selectedTurnaround.length || selectedTurnaround.some(time => 
      (time === 'Within 24 hours' && test.ready.includes('1 day')) ||
      (time === '1-3 days' && test.ready.includes('1-3')) ||
      (time === 'More than 3 days' && test.ready.includes('More than 3'))
    );
    const matchesPrice = test.price >= priceRange[0] && test.price <= priceRange[1];
    const matchesSearch = !searchQuery || 
      [test.title, test.lab, test.category].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesLab && matchesTurnaround && matchesPrice && matchesSearch;
  });

  const sortedTests = [...filteredTests].sort((a, b) => 
    sortOrder === 'priceAsc' ? a.price - b.price :
    sortOrder === 'priceDesc' ? b.price - a.price :
    a.title.localeCompare(b.title)
  );

  const paginatedTests = sortedTests.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const pageCount = Math.ceil(sortedTests.length / itemsPerPage);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedLabs([]);
    setSelectedTurnaround([]);
    setPriceRange([0, 40000]);
    setSearchQuery('');
    setPage(1);
  };

  const filterPanelStyle = {
    width: { xs: '100%', md: 280 },
    p: 3,
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(medicalBackground)}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    bgcolor: 'rgba(240, 255, 185, 0.85)',
    backdropFilter: 'blur(5px)',
    borderRight: { md: '1px solid rgba(255, 255, 255, 0.12)' },
    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 61, 47, 0.7)',
      zIndex: 0
    }
  };

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Filters Panel */}
      <Box sx={filterPanelStyle}>
        <Box position="relative" zIndex={1}>
          <TextField
            fullWidth
            placeholder="Search tests..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search fontSize="small" sx={{ color: 'white', mr: 1 }} />
              ),
              sx: {
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                }
              }
            }}
            sx={{ mb: 3, bgcolor: 'rgba(239, 242, 240, 0.17)' }}
          />

          <FilterSection
            title="Test Categories"
            items={allCategories}
            selected={selectedCategories}
            onChange={(item) => handleFilterChange('categories', item)}
            color="success"
          />

          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'white' }}>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue)}
            min={0}
            max={40000}
            step={1000}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toLocaleString()} ₸`}
            sx={{ 
              my: 2,
              color: 'white',
              '& .MuiSlider-thumb': {
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(10, 45, 8, 0.81)'
                }
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" fontSize={14} color="white">
            <span>from {priceRange[0].toLocaleString()} ₸</span>
            <span>to {priceRange[1].toLocaleString()} ₸</span>
          </Box>

          <FilterSection
            title="Turnaround Time"
            items={turnaroundTimes}
            selected={selectedTurnaround}
            onChange={(item) => handleFilterChange('turnaround', item)}
            color="success"
          />

          <FilterSection
            title="Laboratories"
            items={allLaboratories}
            selected={selectedLabs}
            onChange={(item) => handleFilterChange('labs', item)}
            color="success"
          />

          <Button
            variant="outlined"
            fullWidth
            sx={{ 
              mt: 2,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
            onClick={handleResetFilters}
          >
            Reset All Filters
          </Button>
        </Box>
      </Box>

      {/* Results Section */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
          <Typography variant="h6" color="text.primary" sx={{ mb: { xs: 2, sm: 0 } }}>
            Found {filteredTests.length} tests
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={sortOrder}
            exclusive
            onChange={(_, value) => value && setSortOrder(value)}
            sx={{
              '& .MuiToggleButton-root': {
                color: 'primary.main',
                borderColor: 'primary.main',
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main'
                }
              }
            }}
          >
            <ToggleButton value="priceAsc">Price ↑</ToggleButton>
            <ToggleButton value="priceDesc">Price ↓</ToggleButton>
            <ToggleButton value="nameAsc">A-Z</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {!filteredTests.length ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">No results found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedTests.map((test) => (
                <Grid item xs={12} sm={6} md={4} key={test.id}>
                  <Card sx={cardStyle} onClick={() => handleTestClick(test)}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between">
                        <Chip 
                          label={test.category} 
                          size="small" 
                          color="success" 
                          sx={{ color: 'white', mb: 1 }} 
                        />
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          // Handle bookmark click
                        }}>
                          <BookmarkBorder fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                        {test.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {test.lab}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mt: 1,
                        color: test.ready.includes('1 day') ? 'success.main' :
                               test.ready.includes('1-3') ? 'warning.main' : 'error.main'
                      }}>
                        {test.ready}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Typography fontWeight="bold">{test.price.toLocaleString()} ₸</Typography>
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle add to cart
                        }}
                      >
                        <ShoppingCart fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Test Details Modal - using the imported component */}
      <TestDetailsModal 
        open={modalOpen} 
        handleClose={handleCloseModal} 
        test={selectedTest} 
      />
    </Box>
  );
};

export default CatalogPage;