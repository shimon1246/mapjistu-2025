'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import Map, { Marker, Popup, GeolocateControl, NavigationControl, ScaleControl } from 'react-map-gl'
import { clsx } from 'clsx'

// Type definitions
interface LocationData {
  id: number
  name: string
  longitude: number
  latitude: number
  overallScore: number
  categories: {
    safety: CategoryScore
    hygiene: CategoryScore
    reputation: CategoryScore
    trust: CategoryScore
  }
  reviewCount: number
  lastUpdated: string
  address?: string
  description?: string
}

interface CategoryScore {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'caution'
}

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
}

// Professional UI Components
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default',
  size = 'default',
  className = '',
  ...props 
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  [key: string]: any
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base"
  }

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  onKeyPress, 
  className = '',
  ...props 
}: {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent) => void
  className?: string
  [key: string]: any
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      className={clsx(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

const Card = ({ children, className = '', ...props }: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  return (
    <div 
      className={clsx("rounded-lg border bg-card text-card-foreground shadow-sm mapjitsu-card", className)} 
      {...props}
    >
      {children}
    </div>
  )
}

const Badge = ({ children, variant = 'default', className = '', ...props }: {
  children: React.ReactNode
  variant?: 'default' | 'excellent' | 'good' | 'fair' | 'caution'
  className?: string
  [key: string]: any
}) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    excellent: "safety-excellent",
    good: "safety-good", 
    fair: "safety-fair",
    caution: "safety-caution"
  }

  return (
    <div 
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

// Professional SVG Icons
const SearchIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const MapPinIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ShieldIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const CheckCircleIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertTriangleIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const XCircleIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Mock data with enhanced locations
const mockLocations: LocationData[] = [
  {
    id: 1,
    name: "Downtown Coffee Shop",
    longitude: -74.006,
    latitude: 40.7128,
    overallScore: 8.5,
    address: "123 Broadway, New York, NY",
    description: "Popular coffee shop in the heart of Manhattan",
    categories: {
      safety: { score: 9.2, status: 'excellent' },
      hygiene: { score: 8.1, status: 'good' },
      reputation: { score: 8.3, status: 'good' },
      trust: { score: 8.5, status: 'good' }
    },
    reviewCount: 1247,
    lastUpdated: '2 hours ago'
  },
  {
    id: 2,
    name: "Metro Station Plaza",
    longitude: -74.008,
    latitude: 40.7158,
    overallScore: 6.2,
    address: "456 7th Ave, New York, NY",
    description: "Busy transit hub with mixed reviews",
    categories: {
      safety: { score: 5.8, status: 'caution' },
      hygiene: { score: 6.5, status: 'fair' },
      reputation: { score: 6.4, status: 'fair' },
      trust: { score: 6.1, status: 'fair' }
    },
    reviewCount: 892,
    lastUpdated: '4 hours ago'
  },
  {
    id: 3,
    name: "Riverside Park",
    longitude: -73.989,
    latitude: 40.7242,
    overallScore: 9.1,
    address: "Riverside Dr, New York, NY",
    description: "Beautiful waterfront park with excellent safety record",
    categories: {
      safety: { score: 9.5, status: 'excellent' },
      hygiene: { score: 8.9, status: 'good' },
      reputation: { score: 9.2, status: 'excellent' },
      trust: { score: 8.8, status: 'good' }
    },
    reviewCount: 2156,
    lastUpdated: '1 hour ago'
  },
  {
    id: 4,
    name: "Tech Hub Coworking",
    longitude: -74.012,
    latitude: 40.7089,
    overallScore: 8.8,
    address: "789 Innovation St, New York, NY",
    description: "Modern coworking space with top-tier amenities",
    categories: {
      safety: { score: 9.0, status: 'excellent' },
      hygiene: { score: 8.9, status: 'good' },
      reputation: { score: 8.7, status: 'good' },
      trust: { score: 8.6, status: 'good' }
    },
    reviewCount: 543,
    lastUpdated: '30 minutes ago'
  }
]

// Utility functions
const getScoreColor = (score: number): string => {
  if (score >= 8.5) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 5.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getScoreIcon = (status: string) => {
  const iconProps = { className: "h-4 w-4" }
  switch (status) {
    case 'excellent': return <CheckCircleIcon {...iconProps} />
    case 'good': return <ShieldIcon {...iconProps} />
    case 'fair': return <AlertTriangleIcon {...iconProps} />
    case 'caution': return <XCircleIcon {...iconProps} />
    default: return <MapPinIcon {...iconProps} />
  }
}

const getMarkerColor = (score: number): string => {
  if (score >= 8.5) return '#16a34a' // green-600
  if (score >= 7.0) return '#2563eb' // blue-600
  if (score >= 5.5) return '#ca8a04' // yellow-600
  return '#dc2626' // red-600
}

const getBadgeVariant = (status: string): 'excellent' | 'good' | 'fair' | 'caution' => {
  return status as 'excellent' | 'good' | 'fair' | 'caution'
}

// Main MapJitsu Application
export default function MapJitsu() {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 13
  })
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const mapRef = useRef<any>()

  // Memoized calculations
  const averageScore = useMemo(() => {
    const total = mockLocations.reduce((sum, location) => sum + location.overallScore, 0)
    return (total / mockLocations.length).toFixed(1)
  }, [])

  const totalSignals = useMemo(() => {
    return mockLocations.reduce((sum, location) => sum + location.reviewCount, 0)
  }, [])

  // Event handlers
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      // In production, this would search for actual locations
      const searchResult = mockLocations.find(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address?.toLowerCase().includes(query.toLowerCase())
      )
      
      if (searchResult) {
        setViewState({
          longitude: searchResult.longitude,
          latitude: searchResult.latitude,
          zoom: 15
        })
        setSelectedLocation(searchResult)
      } else {
        // Default to NYC if no match found
        setViewState({
          longitude: -74.006,
          latitude: 40.7128,
          zoom: 14
        })
      }
      setIsSearching(false)
    }, 1000)
  }, [])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue)
    }
  }, [searchValue, handleSearch])

  const handleMarkerClick = useCallback((location: LocationData, e: any) => {
    e.originalEvent.stopPropagation()
    setSelectedLocation(location)
  }, [])

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <div className="w-96 bg-card shadow-xl flex flex-col border-r">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MapJitsu</h1>
              <p className="text-xs text-muted-foreground">Location Intelligence</p>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 text-balance">
            AI-powered insights for safer, smarter navigation
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <SearchIcon />
            </div>
            <Input
              placeholder="Search locations, addresses..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-20 mapjitsu-search"
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <Button
                onClick={() => handleSearch(searchValue)}
                disabled={isSearching}
                size="sm"
                className="h-8"
              >
                {isSearching ? (
                  <div className="mapjitsu-spinner" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground">{averageScore}</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground">{totalSignals.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Signals</div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="flex-1 overflow-y-auto p-6 mapjitsu-sidebar">
          {selectedLocation ? (
            <div className="space-y-6 animate-fade-in">
              {/* Location Header */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {selectedLocation.name}
                </h2>
                {selectedLocation.address && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedLocation.address}
                  </p>
                )}
                {selectedLocation.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedLocation.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="default" className="text-lg font-bold px-4 py-2">
                    {selectedLocation.overallScore}/10
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <div>{selectedLocation.reviewCount.toLocaleString()} signals</div>
                    <div>Updated {selectedLocation.lastUpdated}</div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Category Analysis
                </h3>
                
                <div className="grid gap-3">
                  {Object.entries(selectedLocation.categories).map(([category, data], index) => (
                    <Card 
                      key={category} 
                      className={`p-4 border-l-4 animate-slide-up`}
                      style={{ 
                        borderLeftColor: getMarkerColor(data.score),
                        animationDelay: `${index * 75}ms`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-full bg-background">
                            {getScoreIcon(data.status)}
                          </div>
                          <div>
                            <span className="font-medium capitalize text-foreground">
                              {category}
                            </span>
                            <div className="text-xs text-muted-foreground capitalize">
                              {data.status} rating
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={getBadgeVariant(data.status)}
                          className="font-semibold"
                        >
                          {data.score}/10
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-xs text-muted-foreground">
                  Data sources: Public records, user reports, AI analysis
                </div>
                <div className="text-xs text-muted-foreground">
                  Last verification: {selectedLocation.lastUpdated}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-12 animate-fade-in">
              <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-4">
                <MapPinIcon className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2 text-foreground">Explore Locations</p>
              <p className="text-sm text-balance leading-relaxed">
                Click on any marker on the map to view detailed safety and reputation insights, 
                or use the search bar to find specific locations.
              </p>
              
              {/* Available Locations Preview */}
              <div className="mt-6 text-left">
                <h4 className="text-sm font-medium text-foreground mb-3">Featured Locations:</h4>
                <div className="space-y-2">
                  {mockLocations.slice(0, 3).map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setViewState({
                          longitude: location.longitude,
                          latitude: location.latitude,
                          zoom: 15
                        })
                        setSelectedLocation(location)
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {location.name}
                        </span>
                        <Badge 
                          variant={getBadgeVariant(location.categories.safety.status)}
                          className="text-xs"
                        >
                          {location.overallScore}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          {/* Map Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />
          <ScaleControl position="bottom-right" />

          {/* Location Markers */}
          {mockLocations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              onClick={(e) => handleMarkerClick(location, e)}
            >
              <div className="relative group cursor-pointer">
                <div 
                  className="w-8 h-8 rounded-full border-3 border-white shadow-lg transition-all duration-200 group-hover:scale-125 group-hover:shadow-xl"
                  style={{ backgroundColor: getMarkerColor(location.overallScore) }}
                >
                  <div className="absolute inset-0 rounded-full bg-white/20"></div>
                </div>
                
                {/* Pulse animation for selected marker */}
                {selectedLocation?.id === location.id && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: getMarkerColor(location.overallScore) }}
                  ></div>
                )}
              </div>
            </Marker>
          ))}

          {/* Enhanced Popup */}
          {selectedLocation && (
            <Popup
              longitude={selectedLocation.longitude}
              latitude={selectedLocation.latitude}
              anchor="bottom"
              onClose={() => setSelectedLocation(null)}
              closeButton={false}
              className="mapbox-popup"
            >
              <div className="p-4 min-w-64">
                <h3 className="font-semibold text-sm mb-1 text-foreground">
                  {selectedLocation.name}
                </h3>
                {selectedLocation.address && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedLocation.address}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={getBadgeVariant(selectedLocation.categories.safety.status)}
                    className="text-xs font-semibold"
                  >
                    {selectedLocation.overallScore}/10
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedLocation.reviewCount} signals
                  </span>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Floating Legend */}
        <Card className="absolute bottom-6 left-6 p-4 glass">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Safety Score Legend</h4>
          <div className="space-y-2">
            {[
              { color: '#16a34a', label: 'Excellent (8.5+)', count: mockLocations.filter(l => l.overallScore >= 8.5).length },
              { color: '#2563eb', label: 'Good (7.0+)', count: mockLocations.filter(l => l.overallScore >= 7.0 && l.overallScore < 8.5).length },
              { color: '#ca8a04', label: 'Fair (5.5+)', count: mockLocations.filter(l => l.overallScore >= 5.5 && l.overallScore < 7.0).length },
              { color: '#dc2626', label: 'Caution (<5.5)', count: mockLocations.filter(l => l.overallScore < 5.5).length }
            ].map(({ color, label, count }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-foreground">{label}</span>
                </div>
                <span className="text-muted-foreground font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          © MapJitsu 2025 | © Mapbox
        </div>
      </div>
    </div>
  )
}
