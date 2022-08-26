import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets, plugins } from 'chart.js';
import plugin, * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, defaultColors, Label } from 'ng2-charts';
import jsPDF from 'jspdf';
import { ProyectosService } from '../../services/proyectos.service';

@Component({
  selector: 'app-gra-for-cat',
  templateUrl: './gra-for-cat.component.html',
  styleUrls: ['./gra-for-cat.component.scss']
})
export class GraForCatComponent implements OnInit {

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{
      ticks: {
        beginAtZero: true
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: 'black',
      },
    }
  };

  public barChartColors: Color[] = [
    { backgroundColor: '#97c83c'},
  ];
  public barChartLabels: Label[] = ['Petit', 'Kids', 'Juvenil', 'Media superior', 'Superior', 'Posgrado'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];
  public barChartData: ChartDataSets[];

  categorias:[];
  constructor(private proyectosPorCat: ProyectosService) { }

  ngOnInit() {

    this.barChartData = [{
      data: [],
      label: 'Proyectos por sede'
    }];

    this.proyectosPorCat.getEstadisticasProyectosPorCategoria().subscribe(
      data => {
        this.categorias = data;
        const cat1 = data.estadisticas['petit'];
        const cat2 = data.estadisticas['kids'];
        const cat3 = data.estadisticas['juvenil'];
        const cat4 = data.estadisticas['media-superior'];
        const cat5 = data.estadisticas['superior'];
        const cat6 = data.estadisticas['posgrado'];

        this.barChartData = [{
          data: [cat1, cat2, cat3, cat4, cat5, cat6],
          label: 'Proyectos Por Categoria'
        }];
      },
      err => {
        console.log(err);
      }
    );
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }


  downloadPDF() {
    var canvas: any = document.getElementById('graficaProy3');
    //creates image
    var canvasImg = canvas.toDataURL("image/png", 1.0);

    //creates PDF from img
    var doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 9, 7, 57, 28);
    doc.addImage('assets/cotacytResources/loginImages/cecit.png','png', 243, 5, 50, 40).setFont('Caviar').setFontSize(18).setTextColor('#646464');
    doc.text('Consejo Tamaulipeco de Ciencia y Tecnología', 91, 37);
    doc.addImage(canvasImg, 'JPEG', 15, 50, 260, 135 );
    doc.save('Proyectos-Por-Categoria.pdf');
  }

}
