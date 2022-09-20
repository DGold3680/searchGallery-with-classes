//adjust observer
//axios config
const axiosUnsplash = axios.create({
    baseURL: 'https://api.unsplash.com/',
    timeout: 10000,
    headers:{
      Authorization: 'Client-ID kvGAuU20kySwBrcSKNK4L3WoEzggycbO0g4YmIEfW_c'
    }
  });

function Search({handleSubmit,handleInputChange,inputValue}){
    return  (<div>
    <form onSubmit={handleSubmit}>
    <input className="inputBox" onChange={handleInputChange}value={inputValue}/>
    </form>
    </div>)
}

function Title({children}){
    return (<h1 className="title">{children}</h1>)
}

class Frame extends React.Component{ 
    constructor(props){
    super(props)
    this.state={height:'0'}
    this.img=''
    }
    getFrameHeight(){return this.img.height}
   setFrameHeight(e){
      this.img=e.target
      this.setState({height:this.getFrameHeight()})
   }
   setGridRowEnd(){
       let span=Math.ceil(this.state.height/this.props.gridRowEnd)
       this.img.style.gridRowEnd=`span ${span}`
   }
   componentDidUpdate(pP,pS){
      if(pS!==this.state){
          this.setGridRowEnd()
      }
   }
    render(){
    return (
    <img className="frame" onLoad={this.setFrameHeight.bind(this)} src={this.props.src} alt={this.props.description}/>
    )
    }
}

class Gallery extends React.Component{
    constructor(props){
    super(props)
    this.state={image:[]};
    this.gallery=React.createRef()
    
    }
    
    showImage(){return this.props.images.map((image)=>{
        console.log("ran")
        return <Frame src={image.urls.small} key={image.id} description={image.description} gridRowEnd={this.setGridAutoRow()}/>
    }
   )}
   
   setImage() {this.setState({image:this.showImage()})}
   
   setGridAutoRow(){
       const gridline=1
       this.gallery.current.style.gridAutoRow=`${gridline}px`
       return gridline
   }

 componentDidMount(){
       this.setImage()
       this.setGridAutoRow()
   }
   componentDidUpdate(prevProps,prevState){
      if(prevProps.images!==this.props.images) this.setImage()
   }
   render(){
   return (
       <div className="gallery" ref={this.gallery}>
       {this.state.image}
       </div>
       )
}
}
    
function Footer({children}){
    return (
        <div className="footer">
       {children} </div>)
}

class Infinityscroll extends React.Component{
   constructor (props){
   super(props)
   this.footer=React.createRef()
   this.state={no:20,offsetY:''}
   this.count=1
   this.initCount=0
   }
    
 options = {
  root:null,
  rootMargin: '200px',
  threshold: 0.5
}

//counter towards result limit
resetRequest(){
    this.count=1
    this.initCount=0
    this.setState({no:20})
}

async requestMore(){
    if(this.footer.current.offsetTop>this.state.offsetY&&this.count>this.initCount){
        this.initCount=this.count
   this.count= await this.props.requestMore(this.state.no)
    this.setState({no:this.state.no+10})
    }
}


watchFooter(){
this.observer.observe(this.footer.current)}

setOffsetY(){
    this.setState({offsetY:this.footer.current.offsetTop})
    console.log("set")
}

componentDidMount(){
   (async ()=>{
    this.setOffsetY()
    this.observer = new IntersectionObserver(this.requestMore.bind(this), this.options)
    this.watchFooter()})()
}

componentDidUpdate(pP){
    if(pP.searchTitle!==this.props.searchTitle){
        this.resetRequest()
    }
}
    
 render(){
     return(
     <div ref={this.footer}>
     <Footer>
        Gold's Gallery
     </Footer>
     </div>)
}
}

class App extends React.Component{
    
    state={searchTerm:'',searchTitle:'',searchResult:[]}
    
    async requestPhotos(no) {try{
    const response=await axiosUnsplash({
      method: "get",
      url: "search/photos",
      params: {
        query: `${this.state.searchTerm}`,
        per_page: `${no}`,
      },
    });
    this.results=response.data.results
    console.log(this.results);
    await this.setState({searchResult:this.results})
}catch(e){
        console.log(e)
    }}
    
 async handleSubmit(e){
        e.preventDefault()
        if(this.state.searchTerm!==this.state.searchTitle){
        await this.getPhotos(10)
        this.setState({searchTitle:this.state.searchTerm})}
 }
    
async getPhotos(no){
     await this.requestPhotos(no)
     return this.results.length
 }
    
handleInputChange(e){
        this.setState({searchTerm:e.target.value})
    }
    
    render(){
        return (
        <div>
        <div className="app">
        <div>
        <Search 
        handleSubmit={this.handleSubmit.bind(this)} 
        handleInputChange={this.handleInputChange.bind(this)}
        inputValue={this.state.searchTerm}
        />
        <Title>
        Search Gallery
        </Title>
        </div>
        {this.state.searchResult.length?
        <Gallery images={this.state.searchResult}/>: null
        }
        </div>
        <Infinityscroll requestMore={this.getPhotos.bind(this)} searchTitle={this.state.searchTitle} /> 
        </div>
        )
    }
}
const root=ReactDOM.createRoot(document.querySelector('#root'))

root.render(<App/>)

