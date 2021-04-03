<template>
  <div id="loading">
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 300 1000 1000" xml:space="preserve">
    <g>
      <path class="st0" d="M460,484.8h79.8c6-30.6,30.1-54.7,60.8-60.7v-79.9C526.2,351.2,467,410.4,460,484.8z"/>
      <path class="st1" d="M691.1,484.8h79.8c-7-74.4-66.2-133.6-140.6-140.6V424C661,430,685.1,454.1,691.1,484.8z"/>
      <path class="st0" d="M539.9,515.1c0-0.2,0.1-0.4,0.1-0.6h-0.2h-79.6H460c0,0.2,0,0.4,0.1,0.6c-7.2,35.2-38.2,61.6-75.5,61.6
        c-37.5,0-68.7-26.8-75.6-62.2h-79.8c7.5,79.3,74.2,141.3,155.5,141.3c45.8,0,86.9-19.7,115.5-51c25.4,27.9,60.8,46.6,100.6,50.3
        v-79.9C570.1,569.3,546.1,545.5,539.9,515.1z"/>
      <path class="st0" d="M630.3,575.3v79.9c74.4-7,133.6-66.2,140.6-140.6h-79.8C685.1,545.2,661,569.3,630.3,575.3z"/>
    </g>
    </svg>
  </div>
</template>

<script>
export default {
  computed: {
    theme () {
      return this.$store.state.theme
    }
  }
}
</script>

<style>
#loading {
  width: 100%;
  max-width: 450px;
  margin: 1em;
  text-align: center;  
  -webkit-animation-name: spinner; 
  -webkit-animation-timing-function: linear; 
  -webkit-animation-iteration-count: infinite; 
  -webkit-animation-duration: 1s; 
  animation-name: spinner; 
  animation-timing-function: cubic-bezier(.5,.2,.5,.8); 
  animation-iteration-count: infinite; 
  animation-duration: 1s; 
  -webkit-transform-style: preserve-3d; 
  -moz-transform-style: preserve-3d; 
  -ms-transform-style: preserve-3d; 
  transform-style: preserve-3d;
  -webkit-transform-origin: center center;  /* Chrome, Safari */
}

.st0{fill:black;}
.st1{fill:#C1272D;}

.theme-dark .st0{fill:#F2F2F2;}
.theme-dark .st1{fill:#C1272D;}

  /* WebKit and Opera browsers */ 
@-webkit-keyframes spinner { 
    from 
    { 
        -webkit-transform: rotateY(0deg); 
    } 
    to { 
        -webkit-transform: rotateY(-360deg); 
    } 
} /* all other browsers */ 
@keyframes spinner { 
    from { 
        -moz-transform: rotateY(0deg); 
        -ms-transform: rotateY(0deg); 
        transform: rotateY(0deg); 
    } 
    to 
    { 
        -moz-transform: rotateY(-360deg); 
        -ms-transform: rotateY(-360deg); 
        transform: rotateY(-360deg); 
    
    } 
}
</style>
